import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActivityChart } from "./ActivityChart";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Bar: () => null,
}));

describe("ActivityChart", () => {
  it("provides a screen-reader table equivalent to the visual chart", () => {
    render(
      <ActivityChart
        weeklySummaries={[
          { date: "2026-09-20", users: [{ total_seconds: 3600 }] },
          { date: "2026-09-21", users: [{ total_seconds: 5400 }] },
        ]}
      />,
    );

    expect(screen.getByRole("table", { name: "Tempo registrado nos últimos 7 dias" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Dia" })).toBeInTheDocument();
    expect(screen.getByText("1.0 horas")).toBeInTheDocument();
    expect(screen.getByText("1.5 horas")).toBeInTheDocument();
  });

  it("renders an explicit empty state when there are no summaries", () => {
    render(<ActivityChart weeklySummaries={[]} />);
    expect(screen.getByText(/Nenhum tempo registrado foi retornado/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
