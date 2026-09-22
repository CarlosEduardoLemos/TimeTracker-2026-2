import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchDashboardData, getPreviousDateKeys } from "./api";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("api service", () => {
  it("generates correct previous date keys without offset errors", () => {
    const dates = getPreviousDateKeys("2026-09-11", 7);
    expect(dates).toHaveLength(7);
    expect(dates[6]).toBe("2026-09-11");
    expect(dates[5]).toBe("2026-09-10");
    expect(dates[0]).toBe("2026-09-05");
  });

  it("handles month boundary transitions correctly", () => {
    const dates = getPreviousDateKeys("2026-03-02", 4);
    expect(dates).toEqual([
      "2026-02-27",
      "2026-02-28",
      "2026-03-01",
      "2026-03-02",
    ]);
  });

  it("keeps the main summary and reports optional request degradation", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi.fn(async (url) => {
      if (String(url).includes("/activities/realtime")) {
        throw new Error("realtime indisponível");
      }

      if (String(url).endsWith("/users/")) {
        return { ok: true, json: async () => ({ unexpected: true }) };
      }

      const queryDate = new URL(String(url)).searchParams.get("date");
      return {
        ok: true,
        json: async () => ({ date: queryDate, users: [] }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchDashboardData("2026-09-11", "ana");

    expect(result.summary.users).toEqual([]);
    expect(result.realtime).toEqual([]);
    expect(result.users).toEqual([]);
    expect(result.weeklySummaries).toHaveLength(7);
    expect(result.weeklySummaries.at(-1).date).toBe("2026-09-11");
    expect(result.availability).toEqual({
      realtime: false,
      users: false,
      history: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(9);
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it("marks an unavailable historical day instead of converting it to zero", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi.fn(async (url) => {
      const stringUrl = String(url);
      if (stringUrl.includes("date=2026-09-08")) {
        throw new Error("histórico indisponível");
      }
      if (stringUrl.includes("/activities/realtime") || stringUrl.endsWith("/users/")) {
        return { ok: true, json: async () => [] };
      }

      const queryDate = new URL(stringUrl).searchParams.get("date");
      return { ok: true, json: async () => ({ date: queryDate, users: [] }) };
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchDashboardData("2026-09-11");
    const unavailableDay = result.weeklySummaries.find(
      (summary) => summary.date === "2026-09-08",
    );

    expect(unavailableDay).toMatchObject({ unavailable: true, users: [] });
    expect(result.availability.history).toBe(false);
  });

  it("reuses successful historical summaries on refresh and keeps live sources fresh", async () => {
    const cachedPreviousSummaries = getPreviousDateKeys("2026-09-11", 7)
      .slice(0, 6)
      .map((date) => ({ date, users: [] }));

    const fetchMock = vi.fn(async (url) => {
      const stringUrl = String(url);
      if (stringUrl.includes("/activities/realtime") || stringUrl.endsWith("/users/")) {
        return { ok: true, json: async () => [] };
      }

      return {
        ok: true,
        json: async () => ({ date: "2026-09-11", users: [] }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchDashboardData(
      "2026-09-11",
      "",
      undefined,
      cachedPreviousSummaries,
    );

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.weeklySummaries.slice(0, 6)).toEqual(cachedPreviousSummaries);
    expect(result.weeklySummaries.at(-1).date).toBe("2026-09-11");
  });

  it.each([null, {}, { date: "invalid", users: [] }, { date: "2026-09-11", users: [null] }, { date: "2026-09-11", users: null }])(
    "rejects malformed main summaries instead of displaying zero: %j", async (payload) => {
      vi.stubGlobal("fetch", vi.fn(async (url) => ({
        ok: true,
        json: async () => String(url).includes("/summary")
          ? (String(url).includes("2026-09-11") ? payload : { date: new URL(url).searchParams.get("date"), users: [] })
          : [],
      })));
      await expect(fetchDashboardData("2026-09-11")).rejects.toThrow(/contrato/);
    },
  );

  it("marks malformed history and list entries unavailable without crashing consumers", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(async (url) => ({
      ok: true,
      json: async () => String(url).includes("2026-09-11")
        ? { date: "2026-09-11", users: [] }
        : String(url).includes("/summary") ? { date: "invalid", users: [] } : [null],
    })));
    const data = await fetchDashboardData("2026-09-11");
    expect(data.availability).toEqual({ history: false, users: false, realtime: false });
    expect(data.weeklySummaries[0].unavailable).toBe(true);
  });

  it("times out a stalled response body and releases all request timers", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(async (_url, { signal }) => ({
      ok: true,
      json: () => new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      }),
    })));
    const pending = expect(fetchDashboardData("2026-09-11")).rejects.toMatchObject({ name: "TimeoutError" });
    await vi.advanceTimersByTimeAsync(15_000);
    await pending;
    expect(vi.getTimerCount()).toBe(0);
  });

  it("propagates cancellation without warnings or lingering timers", async () => {
    vi.useFakeTimers();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    })));
    const controller = new AbortController();
    const pending = expect(fetchDashboardData("2026-09-11", "", controller.signal))
      .rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await pending;
    expect(warn).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reports HTTP errors without reading or logging the response body", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const json = vi.fn();
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 422, json })));
    await expect(fetchDashboardData("2026-09-11")).rejects.toThrow("API respondeu com status 422");
    expect(json).not.toHaveBeenCalled();
  });

  it("preserves real DTO fields, nullable names and encoded username filters", async () => {
    const username = "domínio/ana & equipe";
    const user = {
      id: "0199614d-4000-7000-8000-000000000001", username,
      full_name: null, department: null, created_at: "2026-09-11T10:00:00Z",
    };
    const realtime = {
      username, hostname: "PC-01", process_name: "editor.exe",
      window_title: null, category: null, is_idle: false,
      seconds_since_last_activity: 10, status: "online",
    };
    const summaryUser = {
      username, total_seconds: 3600,
      by_category: [{ category: "Outros", color: "#6B7280", total_seconds: 3600 }],
    };
    vi.stubGlobal("fetch", vi.fn(async (url) => {
      const parsed = new URL(url);
      let data;
      if (parsed.pathname === "/users/") data = [user];
      else if (parsed.pathname === "/activities/realtime") data = [realtime];
      else {
        expect(parsed.searchParams.get("username")).toBe(username);
        data = { date: parsed.searchParams.get("date"), users: [summaryUser] };
      }
      return { ok: true, json: async () => data };
    }));
    const result = await fetchDashboardData("2026-09-11", username);
    expect(result.users).toEqual([user]);
    expect(result.realtime).toEqual([realtime]);
    expect(result.summary.users).toEqual([summaryUser]);
    expect(result.availability).toEqual({ realtime: true, users: true, history: true });
  });
});
