import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthPage } from "./AuthPage";

describe("AuthPage", () => {
  it("keeps authentication submission disabled until the API exists", () => {
    render(<AuthPage mode="login" />);
    expect(screen.getByRole("button", { name: "Entrar" })).toBeDisabled();
    expect(screen.getByText(/Autenticação ainda não conectada/i)).toBeInTheDocument();
  });

  it("validates malformed e-mail locally", () => {
    render(<AuthPage mode="cadastro" />);
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "email-invalido" } });
    expect(screen.getByText("Informe um e-mail válido.")).toBeInTheDocument();
  });
});
