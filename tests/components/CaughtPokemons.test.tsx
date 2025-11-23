import { render, screen, fireEvent } from "@testing-library/react";
import CaughtPokemons from "../../app/components/CaughtPokemons";
import { useLocalStoreContext } from "~/contexts";
import { useLocation, useNavigate } from "react-router";
import { POKEMONS_CAUGHT_URL } from "~/services/paths";
import { describe, it, expect, vi } from "vitest";

vi.mock("~/contexts", () => ({
  useLocalStoreContext: vi.fn(),
}));

vi.mock("react-router", () => ({
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
}));

describe("CaughtPokemons component", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as vi.Mock).mockReturnValue(mockNavigate);
  });

  it("renders the caught count correctly", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { caughtPokemons: [1, 2, 3] },
    ]);
    (useLocation as vi.Mock).mockReturnValue({ pathname: "/" });

    render(<CaughtPokemons />);

    const count = screen.getByText("3");
    expect(count).toBeInTheDocument();
  });

  it("applies active styles when on POKEMONS_CAUGHT_URL", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { caughtPokemons: [1, 2] },
    ]);
    (useLocation as vi.Mock).mockReturnValue({ pathname: POKEMONS_CAUGHT_URL });

    render(<CaughtPokemons />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("border border-green-800");

    const textSpan = screen.getByText("Caught");
    expect(textSpan).toHaveClass("!font-bold !text-green-800");
  });

  it("navigates to POKEMONS_CAUGHT_URL on click", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { caughtPokemons: [1] },
    ]);
    (useLocation as vi.Mock).mockReturnValue({ pathname: "/" });

    render(<CaughtPokemons />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith(POKEMONS_CAUGHT_URL);
  });

  it("renders 0 when there are no caught pokemons", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([{ caughtPokemons: [] }]);
    (useLocation as vi.Mock).mockReturnValue({ pathname: "/" });

    render(<CaughtPokemons />);

    const count = screen.getByText("0");
    expect(count).toBeInTheDocument();
  });
});
