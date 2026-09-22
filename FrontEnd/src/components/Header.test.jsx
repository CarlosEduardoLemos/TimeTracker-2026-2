import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "./Header";

describe("Header", () => {
  const defaultProps = {
    formattedDate: "SEXTA-FEIRA, 11 DE SETEMBRO",
    dark: false,
    toggleTheme: vi.fn(),
    selectedDate: "2026-09-11",
    setSelectedDate: vi.fn(),
    apiStatus: "online",
    selectedUsername: "",
    setSelectedUsername: vi.fn(),
    users: [
      { username: "ana", full_name: "Ana Carolina" },
      { username: "bruno", full_name: "Bruno Mendes" },
    ],
    refreshing: false,
    onRefresh: vi.fn(),
    updatedAt: new Date(2026, 8, 11, 14, 30),
  };

  it("renders requirement-aligned heading, date and user options", () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByText(/SEXTA-FEIRA, 11 DE SETEMBRO/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Visão geral da equipe" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Filtrar colaborador" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Toda a equipe" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Ana Carolina" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Bruno Mendes" })).toBeInTheDocument();
    expect(screen.getByText(/sem interpretar atividade como produtividade/i)).toBeInTheDocument();
  });

  it("calls toggleTheme when the theme button is clicked", () => {
    const toggleTheme = vi.fn();
    render(<Header {...defaultProps} toggleTheme={toggleTheme} />);

    fireEvent.click(screen.getByRole("button", { name: "Ativar tema escuro" }));
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it("keeps the selected filter visible when the users source is unavailable", () => {
    render(<Header {...defaultProps} selectedUsername="ana" users={[]} />);
    expect(screen.getByRole("combobox")).toHaveValue("ana");
    expect(screen.getByRole("option", { name: "ana" })).toBeInTheDocument();
  });

  it("calls onRefresh when refresh button is clicked", () => {
    const onRefresh = vi.fn();
    render(<Header {...defaultProps} onRefresh={onRefresh} />);

    fireEvent.click(screen.getByRole("button", { name: "Atualizar dados agora" }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("disables refresh button during refreshing state", () => {
    render(<Header {...defaultProps} refreshing={true} />);
    expect(screen.getByRole("button", { name: "Atualizando dados" })).toBeDisabled();
  });

  it("triggers setSelectedDate when reference date changes", () => {
    const setSelectedDate = vi.fn();
    render(<Header {...defaultProps} setSelectedDate={setSelectedDate} />);

    fireEvent.change(screen.getByLabelText("Data de referência"), {
      target: { value: "2026-09-10" },
    });
    expect(setSelectedDate).toHaveBeenCalledWith("2026-09-10");
  });

  it("triggers setSelectedUsername when user select changes", () => {
    const setSelectedUsername = vi.fn();
    render(<Header {...defaultProps} setSelectedUsername={setSelectedUsername} />);

    fireEvent.change(screen.getByRole("combobox", { name: "Filtrar colaborador" }), {
      target: { value: "ana" },
    });
    expect(setSelectedUsername).toHaveBeenCalledWith("ana");
  });

  it("displays online, degraded, offline and loading API states", () => {
    const { rerender } = render(<Header {...defaultProps} apiStatus="online" />);
    expect(screen.getByText("API online")).toBeInTheDocument();

    rerender(<Header {...defaultProps} apiStatus="degraded" />);
    expect(screen.getByText("API parcialmente disponível")).toBeInTheDocument();

    rerender(<Header {...defaultProps} apiStatus="offline" />);
    expect(screen.getByText("API offline")).toBeInTheDocument();

    rerender(<Header {...defaultProps} apiStatus="loading" />);
    expect(screen.getByText("Conectando à API")).toBeInTheDocument();
  });

  it("documents unavailable period and task filters in the interface", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText(/Filtro por período e task dependem/i)).toBeInTheDocument();
  });
});
