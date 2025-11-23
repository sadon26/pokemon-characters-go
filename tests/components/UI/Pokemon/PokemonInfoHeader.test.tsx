import { render, screen, fireEvent } from "@testing-library/react";
import PokemonInfoHeader from "../../../../app/components/UI/Pokemon/PokemonInfoHeader";
import { PokemonLogo } from "~/assets";

describe("PokemonInfoHeader component", () => {
  const samplePokemon = {
    name: "Pikachu",
    order: 25,
    types: [{ type: { name: "Electric" } }, { type: { name: "Mouse" } }],
    sprites: {
      other: {
        "official-artwork": { front_default: "pikachu.png" },
      },
    },
  };

  it("renders Pokémon name and order", () => {
    render(<PokemonInfoHeader pokemon={samplePokemon} />);

    expect(screen.getByText("Pikachu")).toBeInTheDocument();
    expect(screen.getByText("No. 25")).toBeInTheDocument();
  });

  it("renders all types with correct labels", () => {
    render(<PokemonInfoHeader pokemon={samplePokemon} />);

    samplePokemon.types.forEach(({ type }) => {
      const typeSpan = screen.getByLabelText(type.name);
      expect(typeSpan).toBeInTheDocument();
      expect(typeSpan).toHaveTextContent(type.name);
    });
  });

  it("renders artwork image correctly", () => {
    render(<PokemonInfoHeader pokemon={samplePokemon} />);

    const img = screen.getByAltText("artwork") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("pikachu.png");
  });

  it("falls back to default image if artwork fails to load", () => {
    render(<PokemonInfoHeader pokemon={samplePokemon} />);

    const img = screen.getByAltText("artwork") as HTMLImageElement;
    fireEvent.error(img);
    expect(img.src).toContain(PokemonLogo);
  });
});
