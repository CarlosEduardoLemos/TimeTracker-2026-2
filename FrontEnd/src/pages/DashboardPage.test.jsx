import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./DashboardPage";
import { ActivityChart, PeopleCard } from "../components";

const useDashboardData = vi.fn();

vi.mock("../hooks", () => ({
  useDashboardData: (...args) => useDashboardData(...args),
}));

vi.mock("../components", () => ({
  Header: ({ apiStatus }) => <div data-testid="api-status">{apiStatus}</div>,
  MetricCard: ({ label, value, detail }) => (
    <div>
      <span>{label}</span>
      <span>{value}</span>
      <span>{detail}</span>
    </div>
  ),
  ActivityChart: vi.fn(() => null),
  PeopleCard: vi.fn(() => null),
  ReportsAndAgent: () => null,
  TimelineCard: () => null,
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    useDashboardData.mockReset();
    vi.clearAllMocks();
  });

  it.each([
    [true, null, false],
    [false, new Error("API offline"), true],
  ])("passes loading=%s and availability to data consumers", (loading, error, unavailable) => {
    useDashboardData.mockReturnValue({ data: null, loading, error, refresh: vi.fn() });
    render(<DashboardPage />);
    expect(ActivityChart.mock.calls.at(-1)[0]).toMatchObject({ loading, unavailable });
    expect(PeopleCard.mock.calls.at(-1)[0]).toMatchObject({ loading, unavailable });
  });

  it("identifies retained data after a refresh failure", () => {
    useDashboardData.mockReturnValue({
      data: { realtime: [], users: [], weeklySummaries: [] },
      loading: false,
      error: new Error("API offline"),
      refresh: vi.fn(),
    });
    render(<DashboardPage />);
    expect(screen.getByRole("alert")).toHaveTextContent("última consulta concluída");
    expect(PeopleCard.mock.calls.at(-1)[0].unavailable).toBe(false);
  });

  it("shows degraded state without converting missing realtime data into zero online users", () => {
    useDashboardData.mockReturnValue({
      data: {
        realtime: [],
        users: [],
        weeklySummaries: [],
        availability: { realtime: false, users: true, history: true },
      },
      loading: false,
      refreshing: false,
      error: null,
      updatedAt: new Date(),
      refresh: vi.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByTestId("api-status")).toHaveTextContent("degraded");
    expect(screen.getByText(/Alguns dados estão temporariamente indisponíveis/i)).toBeInTheDocument();
    expect(screen.getByText("dados em tempo real indisponíveis")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    expect(PeopleCard.mock.calls.at(-1)[0].unavailable).toBe(true);
  });
});
