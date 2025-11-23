import { render, screen, fireEvent } from "@testing-library/react";
import PokemonGridView from "../../../../app/components/UI/Pokemons/PokemonGridView";
import { useUpdatePokemons } from "../../../../app/hooks";
import { vi } from "vitest";

vi.mock("../../../../app/hooks", () => ({
  useUpdatePokemons: vi.fn(),
}));

vi.mock("../../../../app/assets", () => ({
  TickIcon: "tick-icon.png",
}));

describe("PokemonGridView component", () => {
  const pokemonsMock = {
    results: [{ name: "pikachu" }, { name: "bulbasaur" }],
    count: 20,
  };

  const paramsMock = { limit: 10, offset: 0 };
  const viewPokemonMock = vi.fn();
  const handlePageClickMock = vi.fn();

  beforeEach(() => {
    (useUpdatePokemons as vi.Mock).mockReturnValue({
      hasCaughtPokemon: (pokemon: any) => pokemon.name === "pikachu",
    });
  });

  it("renders all Pokémon names", () => {
    render(
      <PokemonGridView
        pokemons={pokemonsMock}
        viewPokemon={viewPokemonMock}
        params={paramsMock}
        handlePageClick={handlePageClickMock}
      />
    );

    expect(screen.getByText("pikachu")).toBeInTheDocument();
    expect(screen.getByText("bulbasaur")).toBeInTheDocument();
  });

  it("shows 'Caught' badge for caught Pokémon", () => {
    render(
      <PokemonGridView
        pokemons={pokemonsMock}
        viewPokemon={viewPokemonMock}
        params={paramsMock}
        handlePageClick={handlePageClickMock}
      />
    );

    expect(screen.getByText("Caught")).toBeInTheDocument();
    expect(screen.getByAltText("tick-icon")).toHaveAttribute(
      "src",
      "tick-icon.png"
    );
  });

  it("calls viewPokemon when 'View' button is clicked", () => {
    render(
      <PokemonGridView
        pokemons={pokemonsMock}
        viewPokemon={viewPokemonMock}
        params={paramsMock}
        handlePageClick={handlePageClickMock}
      />
    );

    const buttons = screen.getAllByText("View");
    fireEvent.click(buttons[0]);

    expect(viewPokemonMock).toHaveBeenCalledWith(pokemonsMock.results[0]);
  });
});
