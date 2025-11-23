import { render, screen, fireEvent } from "@testing-library/react";
import PokemonNote from "../../../../app/components/UI/Pokemon/PokemonNote";
import { vi } from "vitest";

describe("PokemonNote component", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders textarea and buttons", () => {
    render(<PokemonNote onSubmit={mockOnSubmit} />);

    const textarea = screen.getByRole("textbox", {
      name: "Pokemon Note",
    }) as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe("");

    expect(screen.getByText("Clear Note & Close")).toBeInTheDocument();
  });

  it("pre-fills textarea if note prop is provided", () => {
    render(<PokemonNote note="Existing note" onSubmit={mockOnSubmit} />);

    const textarea = screen.getByRole("textbox", {
      name: "Pokemon Note",
    }) as HTMLTextAreaElement;
    expect(textarea.value).toBe("Existing note");
  });

  it("updates textarea value on change", () => {
    render(<PokemonNote onSubmit={mockOnSubmit} />);

    const textarea = screen.getByRole("textbox", {
      name: "Pokemon Note",
    }) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "New note" } });
    expect(textarea.value).toBe("New note");
  });

  it("calls onSubmit with the note when Add Note button is clicked", () => {
    render(<PokemonNote onSubmit={mockOnSubmit} />);

    const textarea = screen.getByRole("textbox", {
      name: "Pokemon Note",
    }) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "New note" } });

    const addButton = screen.getByRole("button", { name: "Add Note" });
    fireEvent.click(addButton);

    expect(mockOnSubmit).toHaveBeenCalledWith("New note");
  });

  it("calls onSubmit with empty string when Clear Note & Close button is clicked", () => {
    render(<PokemonNote onSubmit={mockOnSubmit} />);

    const clearButton = screen.getByText("Clear Note & Close");
    fireEvent.click(clearButton);

    expect(mockOnSubmit).toHaveBeenCalledWith("");
  });
});
