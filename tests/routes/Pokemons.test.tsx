import { render, screen, act } from "@testing-library/react";
import Home, { meta } from "../../app/routes/Pokemons";
import { useAxios } from "../../app/hooks";
import { useLocalStoreContext } from "../../app/contexts";
import { vi } from "vitest";

vi.mock("../../app/hooks", () => ({
  useAxios: vi.fn(),
}));

vi.mock("../../app/contexts", () => ({
  useLocalStoreContext: vi.fn(),
}));

vi.mock("../../app/components", () => ({
  Header: vi.fn(() => <div>Header</div>),
  IntroWrapper: vi.fn(() => <div>IntroWrapper</div>),
  HomeLayout: vi.fn(({ children }) => <div>{children}</div>),
  PokemonList: vi.fn(() => <div>PokemonList</div>),
}));

describe("Home component", () => {
  const mockPokemonsData = [{ name: "Pikachu" }, { name: "Bulbasaur" }];
  const setStoreMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAxios as vi.Mock).mockReturnValue({
      loading: false,
      error: false,
      data: mockPokemonsData,
      API: { getPokemons: vi.fn() },
    });
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { pageLoaded: true },
      setStoreMock,
    ]);
  });

  it("renders HomeLayout and PokemonList when pageLoaded is true", () => {
    render(<Home />);
    expect(screen.getByText("PokemonList")).toBeInTheDocument();
  });

  it("renders IntroWrapper when pageLoaded is false", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { pageLoaded: false },
      setStoreMock,
    ]);
    render(<Home />);
    expect(screen.getByText("IntroWrapper")).toBeInTheDocument();
  });

  it("sets pageLoaded after timeout if not loaded", async () => {
    vi.useFakeTimers();
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { pageLoaded: false },
      setStoreMock,
    ]);
    render(<Home />);
    expect(setStoreMock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(setStoreMock).toHaveBeenCalledWith("pageLoaded", true);
    vi.useRealTimers();
  });

  it("returns correct meta information", () => {
    const result = meta({});
    expect(result).toEqual([
      { title: "Pokemon Go App" },
      { name: "description", content: "Welcome to Pokémon Go!" },
    ]);
  });
});
