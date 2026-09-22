import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
  it("renders sitemap navigation and highlights the active route", () => {
    render(<Sidebar activeSection="tasks" />);
    const desktopNav = screen.getAllByRole("navigation", { name: "Menu principal" })[0];
    expect(within(desktopNav).getByRole("link", { name: "Tasks" })).toHaveAttribute("aria-current", "page");
    expect(within(desktopNav).getByRole("link", { name: "Painel" })).not.toHaveAttribute("aria-current");
    expect(within(desktopNav).getByRole("link", { name: "Colaboradores" })).toBeInTheDocument();
    expect(within(desktopNav).getByRole("link", { name: "Relatórios" })).toBeInTheDocument();
    expect(within(desktopNav).getByRole("link", { name: "Configurações" })).toBeInTheDocument();
  });

  it("does not expose a fictitious authenticated manager", () => {
    render(<Sidebar activeSection="painel" />);
    expect(screen.queryByText("Luan Menezes")).not.toBeInTheDocument();
    expect(screen.getByText(/identificação do usuário será exibida após integração/i)).toBeInTheDocument();
  });

  it("opens and closes the mobile menu with Escape", () => {
    render(<Sidebar activeSection="painel" />);
    const openButton = screen.getByRole("button", { name: "Abrir menu" });
    fireEvent.click(openButton);
    expect(screen.getByRole("dialog", { name: "Menu principal mobile" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Menu principal mobile" })).not.toBeInTheDocument();
    expect(openButton).toHaveFocus();
  });

  it("keeps keyboard focus inside the mobile dialog", () => {
    render(<Sidebar activeSection="painel" />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));

    const dialog = screen.getByRole("dialog", { name: "Menu principal mobile" });
    const closeButton = within(dialog).getByRole("button", { name: "Fechar menu" });
    const registerLink = within(dialog).getByRole("link", { name: "Criar conta" });

    closeButton.focus();
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(registerLink).toHaveFocus();

    registerLink.focus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(closeButton).toHaveFocus();
  });
});
