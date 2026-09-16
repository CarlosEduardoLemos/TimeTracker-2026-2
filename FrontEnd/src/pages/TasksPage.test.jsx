import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TasksPage } from "./TasksPage";

describe("TasksPage", () => {
  it("validates a short task description and keeps persistence disabled", () => {
    render(<TasksPage />);
    fireEvent.change(screen.getByLabelText("Descrição"), { target: { value: "ab" } });
    expect(screen.getByText("Informe pelo menos 3 caracteres.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar task" })).toBeDisabled();
  });

  it("clears locally edited task fields", () => {
    render(<TasksPage />);
    const description = screen.getByLabelText("Descrição");
    fireEvent.change(description, { target: { value: "Conferência" } });
    fireEvent.click(screen.getByRole("button", { name: "Limpar formulário" }));
    expect(description).toHaveValue("");
  });
});
