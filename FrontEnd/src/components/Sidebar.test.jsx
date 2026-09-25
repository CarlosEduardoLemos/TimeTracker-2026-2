import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
  it("restores focus when navigation closes the mobile menu", () => {
    render(<Sidebar activeSection="painel" />);
    const openButton = screen.getByRole("button", { name: "Abrir menu" });
    fireEvent.click(openButton);
    const dialog = screen.getByRole("dialog");
    const tasksLink = within(dialog).getByRole("link", { name: "Tasks" });
    tasksLink.focus();
    fireEvent.click(tasksLink);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openButton).toHaveFocus();
    expect(tasksLink).toHaveAttribute("href", "#/tasks");
  });

  it("locks background scrolling only while open and restores it on unmount", () => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "auto";
    try {
      const { unmount } = render(<Sidebar activeSection="painel" />);
      const openButton = screen.getByRole("button", { name: "Abrir menu" });
      fireEvent.click(openButton);
      expect(document.body.style.overflow).toBe("hidden");
      fireEvent.click(screen.getByRole("button", { name: "Fechar menu" }));
      expect(document.body.style.overflow).toBe("auto");
      expect(openButton).toHaveFocus();
      fireEvent.click(openButton);
      unmount();
      expect(document.body.style.overflow).toBe("auto");
    } finally {
      document.body.style.overflow = previousOverflow;
    }
  });

  let desktop;
  beforeEach(() => {
    desktop = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    vi.stubGlobal("matchMedia", vi.fn(() => desktop));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("releases the hidden mobile dialog when resizing to desktop", () => {
    const { unmount } = render(<Sidebar activeSection="painel" />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    desktop.matches = true;
    act(() => desktop.addEventListener.mock.calls[0][1]());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute("aria-expanded", "false");
    unmount();
    expect(desktop.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
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
