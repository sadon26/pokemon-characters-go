import { render, screen } from "@testing-library/react";
import IntroWrapper from "../../app/components/IntroWrapper";
import { PokemonLogo } from "../../app/assets";

describe("IntroWrapper component", () => {
  it("renders the intro screen with correct classes", () => {
    render(<IntroWrapper />);

    const introDiv =
      screen.getByTestId("intro-screen") ||
      screen.getByRole("region", { hidden: true });
    expect(introDiv).toBeInTheDocument();
    expect(introDiv).toHaveClass(
      "fixed inset-0 flex items-center justify-center bg-black intro-fade"
    );
  });

  it("renders the Pokéball image with correct src and alt", () => {
    render(<IntroWrapper />);

    const img = screen.getByAltText("Pokeball Intro") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain(PokemonLogo); // Vitest + jsdom may convert paths
    expect(img).toHaveClass("w-full h-full drop-shadow-2xl");
  });

  it("renders the wrapper div with correct size class", () => {
    render(<IntroWrapper />);

    const wrapperDiv = screen.getByAltText("Pokeball Intro").parentElement;
    expect(wrapperDiv).toHaveClass("w-48 h-48 pokeball-intro");
  });
});
