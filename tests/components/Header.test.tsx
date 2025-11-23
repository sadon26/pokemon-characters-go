import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../../app/components/Header";
import { useLocalStoreContext } from "../../app/contexts";
import { useNavigate, useLocation } from "react-router";
import { useExportCSV } from "../../app/hooks";
import { POKEMONS_URL } from "../../app/services/paths";
import { PikachuEatingGif } from "../../app/assets";
import { vi, describe } from "vitest";

// Mock dependencies
vi.mock("~/contexts", () => ({
  useLocalStoreContext: vi.fn(),
}));

vi.mock("~/hooks", () => ({
  useExportCSV: vi.fn(),
}));

vi.mock("react-router", () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}));

describe("Header component", () => {
  const mockNavigate = vi.fn();
  const mockExportAsCSV = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as vi.Mock).mockReturnValue(mockNavigate);
    (useExportCSV as vi.Mock).mockReturnValue({ exportAsCSV: mockExportAsCSV });
  });

  it("renders logo and title correctly", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([{ caughtPokemons: [] }]);
    (useLocation as vi.Mock).mockReturnValue({ pathname: "/" });

    render(<Header />);

    const logoImg = screen.getByAltText("logo");
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute("src", PikachuEatingGif);

    const title = screen.getByText("Pokémon");
    expect(title).toBeInTheDocument();
  });

  it("navigates to POKEMONS_URL when logo button is clicked", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([{ caughtPokemons: [] }]);
    (useLocation as vi.Mock).mockReturnValue({ pathname: "/" });

    render(<Header />);

    const button = screen.getByRole("button", { name: /pokémon/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith(POKEMONS_URL, {
      state: { from: POKEMONS_URL },
    });
  });

  it("calls exportAsCSV with formatted pokemons when Export CSV button is clicked", () => {
    const store = {
      caughtPokemons: [
        {
          id: 1,
          name: "Pikachu",
          types: [{ type: { name: "Electric" } }],
          height: 4,
          weight: 60,
          timestamp: 123,
        },
      ],
    };
    (useLocalStoreContext as vi.Mock).mockReturnValue([store]);
    (useLocation as vi.Mock).mockReturnValue({ pathname: "/" });

    render(<Header />);

    const exportButton = screen.getByText("Export CSV");
    fireEvent.click(exportButton);

    expect(mockExportAsCSV).toHaveBeenCalledWith({
      pokemons: [
        {
          id: 1,
          name: "Pikachu",
          types: "Electric",
          height: "40cm",
          weight: "6kg",
          timestamp: 123,
        },
      ],
      link: "caught-pokemons",
    });
  });
});
