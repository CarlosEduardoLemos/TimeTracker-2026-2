import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthPage } from "./AuthPage";

describe("AuthPage", () => {
  it("renders the login structure without enabling an unavailable integration", () => {
    render(<AuthPage mode="login" />);

    expect(screen.getByRole("heading", { level: 1, name: "Entrar no Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeDisabled();
  });

  it("associates invalid email feedback with the email field", () => {
    render(<AuthPage mode="login" />);
    const emailInput = screen.getByLabelText("E-mail");

    fireEvent.change(emailInput, { target: { value: "email-invalido" } });

    const error = screen.getByRole("alert", { name: "" });
    expect(error).toHaveTextContent("Informe um e-mail válido.");
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAttribute("aria-describedby", "auth-email-error");
  });

  it("exposes a specific accessible password error", () => {
    render(<AuthPage mode="cadastro" />);
    const passwordInput = screen.getByLabelText("Senha");

    fireEvent.change(passwordInput, { target: { value: "123" } });

    expect(screen.getByText("A senha deve ter pelo menos 8 caracteres.")).toHaveAttribute("role", "alert");
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");
    expect(passwordInput).toHaveAttribute(
      "aria-describedby",
      "auth-password-error password-help",
    );
  });
});
