import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./components/Sidebar", () => ({ Sidebar: () => null }));
afterEach(() => { window.location.hash = ""; });

it("skips to content without replacing the current hash route", () => {
  window.location.hash = "#/tasks";
  render(<App />);
  fireEvent.click(screen.getByRole("link", { name: "Pular para o conteúdo principal" }));
  expect(window.location.hash).toBe("#/tasks");
  expect(screen.getByRole("main")).toHaveFocus();
  expect(screen.getByRole("heading", { level: 1, name: "Tasks" })).toBeInTheDocument();
});
