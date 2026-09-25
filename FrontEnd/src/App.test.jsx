import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./components/Sidebar", () => ({ Sidebar: () => null }));
afterEach(() => {
  window.location.hash = "";
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

it.each(["tasks", "login", "configuracoes"])("restores the theme on direct entry to %s", (route) => {
  localStorage.setItem("timetracker-theme", "dark");
  window.location.hash = `#/${route}`;
  render(<App />);
  expect(document.documentElement.dataset.theme).toBe("dark");
});

it("shows an accessible loading state while a route chunk is loading", () => {
  window.location.hash = "#/tasks";
  render(<App />);
  expect(screen.getByRole("status")).toHaveTextContent("Carregando interface");
});

it("skips to content without replacing the current hash route", async () => {
  window.location.hash = "#/tasks";
  render(<App />);
  fireEvent.click(screen.getByRole("link", { name: "Pular para o conteúdo principal" }));
  expect(window.location.hash).toBe("#/tasks");
  expect(screen.getByRole("main")).toHaveFocus();
  expect(
    await screen.findByRole("heading", { level: 1, name: "Tasks" }),
  ).toBeInTheDocument();
});

it("shows a destination for an unknown route and updates the document title", () => {
  window.location.hash = '#/rota-inexistente';
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Ir para o painel' })).toHaveAttribute('href', '#/painel');
  expect(document.title).toBe('Página não encontrada | TimeTrack');
});
