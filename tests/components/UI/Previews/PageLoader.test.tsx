import { render, screen } from "@testing-library/react";
import PageLoader from "../../../../app/components/UI/Previews/PageLoader";
import { RippleLoader } from "../../../../app/assets";

describe("PageLoader component", () => {
  it("renders the loader image with correct src and alt text", () => {
    render(<PageLoader />);
    const img = screen.getByAltText("Ripple loader") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain(RippleLoader);
  });

  it("renders a container with flex centering classes", () => {
    render(<PageLoader />);
    const container = screen.getByRole("img").parentElement!.parentElement!;
    expect(container).toHaveClass("flex justify-center items-center pt-50");
  });
});
