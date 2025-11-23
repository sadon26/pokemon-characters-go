import { render, screen, fireEvent, act } from "@testing-library/react";
import Pokemon from "../../app/routes/Pokemon";
import { useAxios } from "~/hooks";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import * as htmlToImage from "html-to-image";

vi.mock("../../app/hooks", () => ({
  useAxios: vi.fn(),
}));

vi.mock("../../app/layouts", () => ({
  HomeLayout: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock("../../app/components", () => ({
  Button: vi.fn(({ children, ...props }) => (
    <button {...props}>{children}</button>
  )),
  PokemonInfoHeader: vi.fn(() => <div>PokemonInfoHeader</div>),
  PokemonSkills: vi.fn(() => <div>PokemonSkills</div>),
  PokemonActions: vi.fn(({ sharePokemon }) => (
    <button onClick={sharePokemon}>Share</button>
  )),
  Modal: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock("html-to-image", () => ({
  toPng: vi.fn(),
}));

describe("Pokemon component", () => {
  const mockData = { name: "Pikachu", height: 4, weight: 60 };

  beforeEach(() => {
    (useAxios as vi.Mock).mockReturnValue({
      loading: false,
      error: false,
      data: mockData,
      API: { getPokemon: vi.fn() },
    });
    (htmlToImage.toPng as vi.Mock).mockResolvedValue("mockedDataUrl");
  });

  it("renders header, skills, and actions", () => {
    render(
      <MemoryRouter initialEntries={["/pokemon/1"]}>
        {" "}
        <Routes>
          <Route path="/pokemon/:id" element={<Pokemon />} />{" "}
        </Routes>{" "}
      </MemoryRouter>
    );

    expect(screen.getByText("PokemonInfoHeader")).toBeInTheDocument();
    expect(screen.getByText("PokemonSkills")).toBeInTheDocument();
    expect(screen.getByText("Share")).toBeInTheDocument();
  });

  it("calls API.getPokemon on mount", () => {
    const getPokemonMock = vi.fn();
    (useAxios as vi.Mock).mockReturnValue({
      loading: false,
      error: false,
      data: mockData,
      API: { getPokemon: getPokemonMock },
    });

    render(
      <MemoryRouter initialEntries={["/pokemon/1"]}>
        <Routes>
          <Route path="/pokemon/:id" element={<Pokemon />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getPokemonMock).toHaveBeenCalledWith("1");
  });

  it("opens modal and sets dataUrl when share button clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/pokemon/1"]}>
        {" "}
        <Routes>
          <Route path="/pokemon/:id" element={<Pokemon />} />{" "}
        </Routes>{" "}
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Share"));
    });

    expect(htmlToImage.toPng).toHaveBeenCalled();
    // Modal is mocked, so check by its rendered children presence
    expect(screen.getByText("Download Image")).toBeInTheDocument();
  });
});
