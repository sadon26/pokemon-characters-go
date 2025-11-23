import { render, screen, fireEvent } from "@testing-library/react";
import ViewSwitcher from "../../app/components/ViewSwitcher";
import { useLocalStoreContext } from "~/contexts";
import { vi } from "vitest";

// Mock the local store context
vi.mock("~/contexts", () => ({
  useLocalStoreContext: vi.fn(),
}));

describe("ViewSwitcher component", () => {
  const mockSetStore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { view: "grid" },
      mockSetStore,
    ]);
  });

  it("toggles view from grid to table when clicked", () => {
    render(<ViewSwitcher />);
    const button = screen.getByTitle("Toggle grid / table");
    fireEvent.click(button);
    expect(mockSetStore).toHaveBeenCalledWith("view", "table");
  });

  it("toggles view from table to grid when clicked again", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { view: "table" },
      mockSetStore,
    ]);
    render(<ViewSwitcher />);
    const button = screen.getByTitle("Toggle grid / table");
    fireEvent.click(button);
    expect(mockSetStore).toHaveBeenCalledWith("view", "grid");
  });
});
