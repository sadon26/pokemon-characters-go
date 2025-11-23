import { render, screen, fireEvent } from "@testing-library/react";
import PokedexHeader from "../../../../app/components/UI/Pokedex/PokedexHeader";
import { useLocalStoreContext } from "../../../../app/contexts";
import { vi } from "vitest";
import { SortDownIcon, SortUpIcon, PokemonLogo } from "~/assets";

vi.mock("../../../../app/contexts", () => ({
  useLocalStoreContext: vi.fn(),
}));

describe("PokedexHeader component", () => {
  const mockSetSortDirection = vi.fn();
  const mockUpdateSorting = vi.fn();
  const mockReleaseSelected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly when there are caughtPokemons", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      {
        caughtPokemons: [
          {
            id: 1,
            name: "Pikachu",
            height: 4,
            weight: 60,
            types: [],
            timestamp: 123,
          },
        ],
      },
    ]);

    render(
      <PokedexHeader
        updateSorting={mockUpdateSorting}
        setSortDirection={mockSetSortDirection}
        sortDirection="asc"
        selectedPokemons={[]}
        releaseSelectedPokemons={mockReleaseSelected}
      />
    );

    expect(screen.getByText("My Pokédex")).toBeInTheDocument();
    const logoImg = screen.getByAltText("pikachu-eating") as HTMLImageElement;
    expect(logoImg).toBeInTheDocument();
    expect(logoImg.src).toContain(PokemonLogo);
  });

  it("calls updateSorting when select value changes", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { caughtPokemons: [{ id: 1, name: "Pikachu" }] },
    ]);
    render(
      <PokedexHeader
        updateSorting={mockUpdateSorting}
        setSortDirection={mockSetSortDirection}
        sortDirection="asc"
        selectedPokemons={[]}
        releaseSelectedPokemons={mockReleaseSelected}
      />
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "height" } });

    expect(mockUpdateSorting).toHaveBeenCalledTimes(1);
  });

  it("toggles sort direction when sort button is clicked", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { caughtPokemons: [{ id: 1, name: "Pikachu" }] },
    ]);
    render(
      <PokedexHeader
        updateSorting={mockUpdateSorting}
        setSortDirection={mockSetSortDirection}
        sortDirection="asc"
        selectedPokemons={[]}
        releaseSelectedPokemons={mockReleaseSelected}
      />
    );

    const sortButton = screen.getByRole("button", { name: /sort up\/down/i });
    fireEvent.click(sortButton);

    expect(mockSetSortDirection).toHaveBeenCalledWith(expect.any(Function));
  });

  it("renders release button when selectedPokemons is non-empty and calls releaseSelectedPokemons on click", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { caughtPokemons: [{ id: 1, name: "Pikachu" }] },
    ]);
    render(
      <PokedexHeader
        updateSorting={mockUpdateSorting}
        setSortDirection={mockSetSortDirection}
        sortDirection="asc"
        selectedPokemons={[{ id: 1, name: "Pikachu" }]}
        releaseSelectedPokemons={mockReleaseSelected}
      />
    );

    const releaseButton = screen.getByText(/Release 1 selected pokémon/i);
    expect(releaseButton).toBeInTheDocument();

    fireEvent.click(releaseButton);
    expect(mockReleaseSelected).toHaveBeenCalledTimes(1);
  });

  it("renders correct sort icon based on sortDirection prop", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { caughtPokemons: [{ id: 1, name: "Pikachu" }] },
    ]);

    const { rerender } = render(
      <PokedexHeader
        updateSorting={mockUpdateSorting}
        setSortDirection={mockSetSortDirection}
        sortDirection="asc"
        selectedPokemons={[]}
        releaseSelectedPokemons={mockReleaseSelected}
      />
    );

    let iconImg = screen.getByAltText("sort-icon") as HTMLImageElement;
    expect(iconImg.src).toContain(SortUpIcon);

    rerender(
      <PokedexHeader
        updateSorting={mockUpdateSorting}
        setSortDirection={mockSetSortDirection}
        sortDirection="desc"
        selectedPokemons={[]}
        releaseSelectedPokemons={mockReleaseSelected}
      />
    );

    iconImg = screen.getByAltText("sort-icon") as HTMLImageElement;
    expect(iconImg.src).toContain(SortDownIcon);
  });
});
