import { render, screen } from "@testing-library/react";
import PokemonSkills from "../../../../app/components/UI/Pokemon/PokemonSkills";
import { useLocalStoreContext } from "~/contexts";
import { vi } from "vitest";

// Mock the context
vi.mock("../../../../app/contexts", () => ({
  useLocalStoreContext: vi.fn(),
}));

describe("PokemonSkills component", () => {
  const samplePokemon = {
    id: 1,
    name: "Pikachu",
    height: 4,
    weight: 60,
    base_experience: 50,
    moves: [
      { move: { name: "thunder-shock" } },
      { move: { name: "quick-attack" } },
    ],
    abilities: [
      { ability: { name: "static" } },
      { ability: { name: "lightning-rod" } },
    ],
    forms: [{ name: "pikachu-original" }],
  };

  it("renders physical stats correctly", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([{ caughtPokemons: [] }]);
    render(<PokemonSkills pokemon={samplePokemon} />);

    expect(screen.getByText("Height")).toBeInTheDocument();
    expect(
      screen.getByText(`${samplePokemon.height * 10}cm`)
    ).toBeInTheDocument();
    expect(screen.getByText("Weight")).toBeInTheDocument();
    expect(
      screen.getByText(`${samplePokemon.weight / 10}kg`)
    ).toBeInTheDocument();
  });

  it("renders base stats with progress bar", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([{ caughtPokemons: [] }]);
    render(<PokemonSkills pokemon={samplePokemon} />);

    expect(screen.getByText("Base Stats")).toBeInTheDocument();
    expect(
      screen.getByText(samplePokemon.base_experience.toString())
    ).toBeInTheDocument();
    const progressBar = screen.getByRole("progressbar", {
      name: "Base expoerience",
    });
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute(
      "aria-valuenow",
      samplePokemon.base_experience.toString()
    );
  });

  it("renders moves, abilities, and forms", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([{ caughtPokemons: [] }]);
    render(<PokemonSkills pokemon={samplePokemon} />);

    expect(screen.getByText("Moves")).toBeInTheDocument();
    expect(
      screen.getByText("thunder-shock, quick-attack.")
    ).toBeInTheDocument();

    expect(screen.getByText("Abilities")).toBeInTheDocument();
    expect(screen.getByText("static, lightning-rod.")).toBeInTheDocument();

    expect(screen.getByText("Forms")).toBeInTheDocument();
    expect(screen.getByText("pikachu-original.")).toBeInTheDocument();
  });

  it("renders note and timestamp if Pokémon is caught", () => {
    const caughtPokemon = {
      ...samplePokemon,
      note: "Electric type",
      timestamp: "2025-11-23",
    };
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { caughtPokemons: [caughtPokemon] },
    ]);
    render(<PokemonSkills pokemon={samplePokemon} />);

    expect(screen.getByText(caughtPokemon.note)).toBeInTheDocument();
    expect(screen.getByText(caughtPokemon.timestamp)).toBeInTheDocument();
  });
});
