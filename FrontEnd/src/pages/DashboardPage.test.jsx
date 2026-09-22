import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./DashboardPage";

const useDashboardData = vi.fn();

vi.mock("../hooks", () => ({
  useDashboardData: (...args) => useDashboardData(...args),
  useTheme: () => [false, vi.fn()],
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
  ActivityChart: () => null,
  PeopleCard: () => null,
  ReportsAndAgent: () => null,
  TimelineCard: () => null,
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    useDashboardData.mockReset();
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
  });
});
