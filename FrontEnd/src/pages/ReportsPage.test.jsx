import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReportsPage } from "./ReportsPage";

describe("ReportsPage", () => {
  it("keeps incomplete exports disabled", () => {
    render(<ReportsPage />);
    expect(screen.getByRole("button", { name: "Exportar CSV" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Exportar PDF" })).toBeDisabled();
  });
});
