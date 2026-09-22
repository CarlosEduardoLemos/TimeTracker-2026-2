import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchDashboardData, getPreviousDateKeys } from "./api";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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
        json: async () => ({ date: queryDate, users: null }),
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
});
