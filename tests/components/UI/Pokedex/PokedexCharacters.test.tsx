import { render, screen, fireEvent } from "@testing-library/react";
import PokedexCharacters from "../../../../app/components/UI/Pokedex/PokedexCharacters";
import { useNavigate } from "react-router";
import { vi } from "vitest";
import { PokemonLogo } from "../../../../app/assets";

vi.mock("react-router", () => ({
  useNavigate: vi.fn(),
}));

describe("PokedexCharacters component", () => {
  const mockNavigate = vi.fn();
  const mockUpdateSelections = vi.fn();
  const mockSetShowModal = vi.fn();
  const mockSetSelectedItem = vi.fn();

  const samplePokemon = {
    id: 1,
    name: "Pikachu",
    height: 4,
    weight: 60,
    timestamp: "2025-11-23",
    sprites: {
      other: {
        "official-artwork": { front_default: "pikachu.png" },
      },
    },
    note: "Electric type",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as vi.Mock).mockReturnValue(mockNavigate);
  });

  it("renders Pokémon cards correctly", () => {
    render(
      <PokedexCharacters
        sortBy="name"
        sortDirection="asc"
        sortedPokemons={() => [samplePokemon]}
        pokemonSelected={() => false}
        updatePokemonSelections={mockUpdateSelections}
        setShowModal={mockSetShowModal}
        setSelectedPokemonItem={mockSetSelectedItem}
      />
    );

    expect(screen.getByText("Pikachu")).toBeInTheDocument();
    expect(screen.getByText("Date added")).toBeInTheDocument();
    expect(screen.getByText("Height")).toBeInTheDocument();
    expect(screen.getByText("Weight")).toBeInTheDocument();
    expect(screen.getByText("Note")).toBeInTheDocument();
  });

  it("selects/unselects Pokémon when select button is clicked", () => {
    const pokemonSelected = vi.fn().mockReturnValue(false);
    render(
      <PokedexCharacters
        sortBy="name"
        sortDirection="asc"
        sortedPokemons={() => [samplePokemon]}
        pokemonSelected={pokemonSelected}
        updatePokemonSelections={mockUpdateSelections}
        setShowModal={mockSetShowModal}
        setSelectedPokemonItem={mockSetSelectedItem}
      />
    );

    const selectButton = screen.getByText("Select");
    fireEvent.click(selectButton);
    expect(mockUpdateSelections).toHaveBeenCalledWith(samplePokemon);
  });

  it("calls setShowModal and setSelectedPokemonItem when Add Note is clicked", () => {
    render(
      <PokedexCharacters
        sortBy="name"
        sortDirection="asc"
        sortedPokemons={() => [samplePokemon]}
        pokemonSelected={() => false}
        updatePokemonSelections={mockUpdateSelections}
        setShowModal={mockSetShowModal}
        setSelectedPokemonItem={mockSetSelectedItem}
      />
    );

    const addNoteButton = screen.getByText("Add Note");
    fireEvent.click(addNoteButton);

    expect(mockSetShowModal).toHaveBeenCalledWith(expect.any(Function));
    expect(mockSetSelectedItem).toHaveBeenCalledWith(samplePokemon);
  });

  it("navigates to Pokémon detail when View button is clicked", () => {
    render(
      <PokedexCharacters
        sortBy="name"
        sortDirection="asc"
        sortedPokemons={() => [samplePokemon]}
        pokemonSelected={() => false}
        updatePokemonSelections={mockUpdateSelections}
        setShowModal={mockSetShowModal}
        setSelectedPokemonItem={mockSetSelectedItem}
      />
    );

    const viewButton = screen.getByRole("button", { name: /view pokémon/i });
    fireEvent.click(viewButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/pokemons/${samplePokemon.id}`);
  });

  it("falls back to default image if artwork fails to load", () => {
    render(
      <PokedexCharacters
        sortBy="name"
        sortDirection="asc"
        sortedPokemons={() => [samplePokemon]}
        pokemonSelected={() => false}
        updatePokemonSelections={mockUpdateSelections}
        setShowModal={mockSetShowModal}
        setSelectedPokemonItem={mockSetSelectedItem}
      />
    );

    const img = screen.getByAltText("artwork") as HTMLImageElement;
    fireEvent.error(img);

    expect(img.src).toContain(PokemonLogo);
  });
});
