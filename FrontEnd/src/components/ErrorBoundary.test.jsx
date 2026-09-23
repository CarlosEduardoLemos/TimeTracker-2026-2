import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

function BrokenComponent() {
  throw new Error("falha de teste");
}

afterEach(() => {
  vi.restoreAllMocks();
});

it("shows a safe fallback when a descendant fails during render", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  render(
    <ErrorBoundary>
      <BrokenComponent />
    </ErrorBoundary>,
  );

  expect(
    screen.getByRole("heading", { name: "Não foi possível exibir esta tela" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Recarregar aplicação" })).toBeInTheDocument();
  expect(screen.queryByText("falha de teste")).not.toBeInTheDocument();
});
