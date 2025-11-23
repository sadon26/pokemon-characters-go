import { render, screen, fireEvent } from "@testing-library/react";
import PokemonTableView from "../../../../app/components/UI/Pokemons/PokemonTableView";

import { useUpdatePokemons } from "../../../../app/hooks";
import { vi } from "vitest";

vi.mock("../../../../app/hooks", () => ({
  useUpdatePokemons: vi.fn(),
}));

vi.mock("../../../../app/assets", () => ({
  TickIcon: "tick-icon.png",
}));

describe("PokemonTableView component", () => {
  const pokemonsMock = {
    results: [
      { name: "pikachu", url: "/pikachu" },
      { name: "bulbasaur", url: "/bulbasaur" },
    ],
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

  it("renders table headers", () => {
    render(
      <PokemonTableView
        pokemons={pokemonsMock}
        viewPokemon={viewPokemonMock}
        params={paramsMock}
        handlePageClick={handlePageClickMock}
      />
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("URL")).toBeInTheDocument();
    expect(screen.getByText("Caught Pokémons")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("renders all Pokémon names and URLs", () => {
    render(
      <PokemonTableView
        pokemons={pokemonsMock}
        viewPokemon={viewPokemonMock}
        params={paramsMock}
        handlePageClick={handlePageClickMock}
      />
    );

    expect(screen.getByText("pikachu")).toBeInTheDocument();
    expect(screen.getByText("/pikachu")).toBeInTheDocument();
    expect(screen.getByText("bulbasaur")).toBeInTheDocument();
    expect(screen.getByText("/bulbasaur")).toBeInTheDocument();
  });

  it("shows 'Caught' badge for caught Pokémon", () => {
    render(
      <PokemonTableView
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
      <PokemonTableView
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
