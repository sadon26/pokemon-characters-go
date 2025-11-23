import { renderHook, act } from "@testing-library/react";
import useLocalStore, { localKeys } from "../../app/hooks/useLocalStore";

describe("useLocalStore hook", () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      clear: () => {
        store = {};
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    };
  })();

  beforeAll(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with default values if localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStore());
    const [store] = result.current;

    expect(store.view).toBe("grid");
    expect(store.caughtPokemons).toEqual([]);
    expect(store.pageLoaded).toBe(false);
  });

  it("reads values from localStorage if available", () => {
    const stored = { view: "table", caughtPokemons: [], pageLoaded: true };
    localStorage.setItem("global", JSON.stringify(stored));

    const { result } = renderHook(() => useLocalStore());
    const [store] = result.current;

    expect(store).toEqual(stored);
  });

  it("updates store and writes to localStorage", () => {
    const { result } = renderHook(() => useLocalStore());
    const [, setStore] = result.current;

    act(() => {
      setStore(localKeys.view, "table");
    });

    const [updatedStore] = result.current;
    expect(updatedStore.view).toBe("table");

    const saved = JSON.parse(localStorage.getItem("global") || "{}");
    expect(saved.view).toBe("table");
  });

  it("updates other keys correctly", () => {
    const { result } = renderHook(() => useLocalStore());
    const [, setStore] = result.current;

    act(() => {
      setStore(localKeys.pageLoaded, true);
    });

    const [updatedStore] = result.current;
    expect(updatedStore.pageLoaded).toBe(true);

    const saved = JSON.parse(localStorage.getItem("global") || "{}");
    expect(saved.pageLoaded).toBe(true);
  });
});
