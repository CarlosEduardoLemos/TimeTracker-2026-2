import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useHashRoute } from "./useHashRoute";

afterEach(() => {
  window.location.hash = "";
});

describe("useHashRoute", () => {
  it("uses painel as fallback for unknown routes", () => {
    window.location.hash = "#/rota-inexistente";
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toBe("painel");
  });

  it("updates when the hash changes", () => {
    window.location.hash = "#/painel";
    const { result } = renderHook(() => useHashRoute());
    act(() => {
      window.location.hash = "#/tasks";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(result.current).toBe("tasks");
  });
});
