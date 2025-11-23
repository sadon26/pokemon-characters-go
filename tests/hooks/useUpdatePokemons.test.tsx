import { renderHook, act } from "@testing-library/react";
import useUpdatePokemons from "../../app/hooks/useUpdatePokemons";
import { useLocalStoreContext } from "~/contexts";
import { vi } from "vitest";

vi.mock("../../app/contexts", () => ({
  useLocalStoreContext: vi.fn(),
}));

describe("useUpdatePokemons hook", () => {
  const mockSetStore = vi.fn();
  const samplePokemon = { name: "Pikachu" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects if a pokemon has been caught", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { caughtPokemons: [samplePokemon] },
      mockSetStore,
    ]);

    const { result } = renderHook(() => useUpdatePokemons());
    expect(result.current.hasCaughtPokemon(samplePokemon)).toBe(true);
    expect(result.current.hasCaughtPokemon({ name: "Bulbasaur" })).toBe(false);
  });

  it("catches a new pokemon if not already caught", () => {
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { caughtPokemons: [] },
      mockSetStore,
    ]);

    const { result } = renderHook(() => useUpdatePokemons());

    act(() => {
      result.current.catchPokemon(samplePokemon);
    });

    expect(mockSetStore).toHaveBeenCalledTimes(1);
    const calledArg = mockSetStore.mock.calls[0][1];
    expect(calledArg[0].name).toBe("Pikachu");
    expect(calledArg[0].timestamp).toBeDefined();
  });

  it("alerts if pokemon is already caught", () => {
    global.alert = vi.fn();
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { caughtPokemons: [samplePokemon] },
      mockSetStore,
    ]);

    const { result } = renderHook(() => useUpdatePokemons());

    act(() => {
      result.current.catchPokemon(samplePokemon);
    });

    expect(global.alert).toHaveBeenCalledWith("Pikachu already added!");
    expect(mockSetStore).not.toHaveBeenCalled();
  });

  it("removes a caught pokemon", () => {
    const anotherPokemon = { name: "Bulbasaur" };
    (useLocalStoreContext as vi.Mock).mockReturnValue([
      { caughtPokemons: [samplePokemon, anotherPokemon] },
      mockSetStore,
    ]);

    const { result } = renderHook(() => useUpdatePokemons());

    act(() => {
      result.current.removePokemon(samplePokemon);
    });

    expect(mockSetStore).toHaveBeenCalledTimes(1);
    const updatedPokemons = mockSetStore.mock.calls[0][1];
    expect(updatedPokemons).toEqual([anotherPokemon]);
  });
});
