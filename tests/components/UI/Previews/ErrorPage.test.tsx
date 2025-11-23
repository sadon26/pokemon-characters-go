import { render, screen } from "@testing-library/react";
import ErrorPage from "../../../../app/components/UI/Previews/ErrorPage";
import { PikachuError } from "~/assets";

describe("ErrorPage component", () => {
  it("renders the Pikachu error image", () => {
    render(<ErrorPage />);
    const img = screen.getByAltText("pikachu-error") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain(PikachuError);
  });

  it("renders the error message", () => {
    render(<ErrorPage />);
    expect(screen.getByText("Error loading data...")).toBeInTheDocument();
  });
});
