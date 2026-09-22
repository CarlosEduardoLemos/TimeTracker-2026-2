import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchDashboardData } from "../services/api";
import { useDashboardData } from "./useDashboardData";

vi.mock("../services/api", () => ({
  fetchDashboardData: vi.fn(),
}));

vi.mock("./useAutoRefresh", () => ({
  useAutoRefresh: vi.fn(),
}));

const dashboardData = {
  summary: { users: [] },
  realtime: [],
  users: [],
  weeklySummaries: [],
};

describe("useDashboardData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads dashboard data and exposes the last update timestamp", async () => {
    fetchDashboardData.mockResolvedValueOnce(dashboardData);

    const { result } = renderHook(() =>
      useDashboardData("2026-09-21", "ana", false),
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(dashboardData);
    expect(result.current.error).toBeNull();
    expect(result.current.updatedAt).toBeInstanceOf(Date);
    expect(fetchDashboardData).toHaveBeenCalledWith(
      "2026-09-21",
      "ana",
      expect.any(AbortSignal),
    );
  });

  it("keeps current data visible while manually refreshing the same filter", async () => {
    let resolveRefresh;
    fetchDashboardData
      .mockResolvedValueOnce(dashboardData)
      .mockImplementationOnce(
        () => new Promise((resolve) => { resolveRefresh = resolve; }),
      );

    const { result } = renderHook(() =>
      useDashboardData("2026-09-21", "", false),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.refresh());

    await waitFor(() => expect(result.current.refreshing).toBe(true));
    expect(result.current.data).toEqual(dashboardData);

    act(() => resolveRefresh(dashboardData));
    await waitFor(() => expect(result.current.refreshing).toBe(false));
  });

  it("exposes request failures without replacing them with fictitious data", async () => {
    const requestError = new Error("API indisponível");
    fetchDashboardData.mockRejectedValueOnce(requestError);

    const { result } = renderHook(() =>
      useDashboardData("2026-09-21", "", false),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(requestError);
  });

  it("ignores a stale response after the filter changes", async () => {
    let resolveFirstRequest;
    fetchDashboardData
      .mockImplementationOnce(
        () => new Promise((resolve) => { resolveFirstRequest = resolve; }),
      )
      .mockResolvedValueOnce({ ...dashboardData, summary: { users: [{ username: "bruno" }] } });

    const { result, rerender } = renderHook(
      ({ username }) => useDashboardData("2026-09-21", username, false),
      { initialProps: { username: "ana" } },
    );

    rerender({ username: "bruno" });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.summary.users[0].username).toBe("bruno");

    act(() => resolveFirstRequest({ ...dashboardData, summary: { users: [{ username: "ana" }] } }));

    await act(async () => Promise.resolve());
    expect(result.current.data.summary.users[0].username).toBe("bruno");
  });
});
