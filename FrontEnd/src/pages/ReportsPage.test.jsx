import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReportsPage } from "./ReportsPage";

describe("ReportsPage", () => {
  it("offers the existing daily exports with their limited scope explained", () => {
    render(<ReportsPage />);
    expect(screen.getByRole("button", { name: "Exportar CSV" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Exportar PDF" })).toBeEnabled();
    expect(screen.getByText(/O arquivo contém usuário, categoria e tempo registrado de um dia/)).toBeInTheDocument();
  });
});
