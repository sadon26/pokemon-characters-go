import { render, screen, fireEvent } from "@testing-library/react";
import PokemonList from "../../../../app/components/UI/Pokemons/PokemonList";
import { useLocalStoreContext } from "../../../../app/contexts";
import { useNavigate } from "react-router";
import { vi } from "vitest";

vi.mock("../../../../app/contexts", () => ({
  useLocalStoreContext: vi.fn(),
}));

vi.mock("react-router", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("../../../../app/components/UI/Pokemons/PokemonGridView", () => ({
  default: vi.fn(({ pokemons, viewPokemon }) => (
    <div>
      {" "}
      <div>PokemonGridView</div>
      <button onClick={() => viewPokemon(pokemons.results[0])}>
        View
      </button>{" "}
    </div>
  )),
}));

vi.mock("../../../../app/components/UI/Pokemons/PokemonTableView", () => ({
  default: vi.fn(({ pokemons, viewPokemon }) => (
    <div>
      {" "}
      <div>PokemonTableView</div>
      <button onClick={() => viewPokemon(pokemons.results[0])}>
        View
      </button>{" "}
    </div>
  )),
}));

describe("PokemonList component", () => {
  const pokemonsMock = {
    results: [{ name: "pikachu", url: "/1/" }],
    count: 1,
  };
  const paramsMock = { limit: 10, offset: 0 };
  const onPaginateMock = vi.fn();
  const navigateMock = vi.fn();

  beforeEach(() => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([{ view: "grid" }]);
    (useNavigate as vi.Mock).mockReturnValue(navigateMock);
    vi.clearAllMocks();
  });

  it("renders PokemonGridView when view is 'grid'", () => {
    render(
      <PokemonList
        pokemons={pokemonsMock}
        params={paramsMock}
        onPaginate={onPaginateMock}
      />
    );

    expect(screen.getByText("PokemonGridView")).toBeInTheDocument();
    fireEvent.click(screen.getByText("View"));
    expect(navigateMock).toHaveBeenCalledWith("/pokemons/1");
  });

  it("renders PokemonTableView when view is 'table'", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([{ view: "table" }]);
    render(
      <PokemonList
        pokemons={pokemonsMock}
        params={paramsMock}
        onPaginate={onPaginateMock}
      />
    );

    expect(screen.getByText("PokemonTableView")).toBeInTheDocument();
    fireEvent.click(screen.getByText("View"));
    expect(navigateMock).toHaveBeenCalledWith("/pokemons/1");
  });
});
