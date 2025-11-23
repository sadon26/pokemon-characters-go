import { render, screen, fireEvent } from "@testing-library/react";
import PokemonAction from "../../../../app/components/UI/Pokemon/PokemonActions";
import { vi } from "vitest";
import { useUpdatePokemons } from "~/hooks";

vi.mock("~/hooks", () => ({
  useUpdatePokemons: vi.fn(),
}));

describe("PokemonAction component", () => {
  const mockCatch = vi.fn();
  const mockRemove = vi.fn();
  const mockHasCaught = vi.fn();
  const mockShare = vi.fn();

  const samplePokemon = {
    id: 1,
    name: "Pikachu",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useUpdatePokemons as vi.Mock).mockReturnValue({
      catchPokemon: mockCatch,
      removePokemon: mockRemove,
      hasCaughtPokemon: mockHasCaught,
    });
  });

  it("renders Share button and calls sharePokemon on click", () => {
    render(<PokemonAction pokemon={samplePokemon} sharePokemon={mockShare} />);
    const shareButton = screen.getByText("Share");
    expect(shareButton).toBeInTheDocument();

    fireEvent.click(shareButton);
    expect(mockShare).toHaveBeenCalledTimes(1);
  });

  it("renders Catch button when pokemon is not caught", () => {
    mockHasCaught.mockReturnValue(false);

    render(<PokemonAction pokemon={samplePokemon} sharePokemon={mockShare} />);
    const catchButton = screen.getByText(`Catch ${samplePokemon.name}`);
    expect(catchButton).toBeInTheDocument();

    fireEvent.click(catchButton);
    expect(mockCatch).toHaveBeenCalledWith(samplePokemon);
  });

  it("renders Remove button when pokemon is caught", () => {
    mockHasCaught.mockReturnValue(true);

    render(<PokemonAction pokemon={samplePokemon} sharePokemon={mockShare} />);
    const removeButton = screen.getByText(`Remove ${samplePokemon.name}`);
    expect(removeButton).toBeInTheDocument();

    fireEvent.click(removeButton);
    expect(mockRemove).toHaveBeenCalledWith(samplePokemon);
  });
});
