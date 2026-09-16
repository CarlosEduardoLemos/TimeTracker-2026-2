import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PeopleCard } from "./PeopleCard";

describe("PeopleCard", () => {
  it("renders only requirement-aligned real-time fields", () => {
    const realtimePeople = [
      {
        username: "carlos",
        hostname: "WORK-01",
        process_name: "Code.exe",
        window_title: "conteúdo que não deve ser exibido",
        category: "Desenvolvimento",
        status: "online",
        seconds_since_last_activity: 45,
      },
    ];

    render(<PeopleCard realtimePeople={realtimePeople} />);

    expect(screen.getByText("carlos")).toBeInTheDocument();
    expect(screen.getByText("CA")).toBeInTheDocument();
    expect(screen.getByText("Code.exe")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.getByText("há 45s")).toBeInTheDocument();
    expect(screen.queryByText("WORK-01")).not.toBeInTheDocument();
    expect(screen.queryByText("conteúdo que não deve ser exibido")).not.toBeInTheDocument();
    expect(screen.queryByText("Desenvolvimento")).not.toBeInTheDocument();
  });

  it("renders an empty state without falling back to demo users", () => {
    render(<PeopleCard realtimePeople={[]} />);

    expect(
      screen.getByText("Nenhum colaborador foi retornado para o filtro atual."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Ana Carolina")).not.toBeInTheDocument();
  });
});
