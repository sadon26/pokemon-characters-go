import { renderHook } from "@testing-library/react";
import {
  LocalStore,
  useLocalStoreContext,
} from "../../app/contexts/LocalStore";
import { vi } from "vitest";
import { useLocalStore } from "../../app/hooks";

vi.mock("../../app/hooks", () => ({
  useLocalStore: vi.fn(),
}));

describe("LocalStore context", () => {
  const mockSetStore = vi.fn();
  const mockStore = { view: "grid", caughtPokemons: [], pageLoaded: false };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLocalStore as vi.Mock).mockReturnValue([mockStore, mockSetStore]);
  });

  it("provides the store and setStore function via context", () => {
    const wrapper = ({ children }: any) => <LocalStore>{children}</LocalStore>;
    const { result } = renderHook(() => useLocalStoreContext(), { wrapper });

    const [store, setStore] = result.current;

    expect(store).toEqual(mockStore);
    expect(typeof setStore).toBe("function");

    // test calling setStore
    setStore("view", "table");
    expect(mockSetStore).toHaveBeenCalledWith("view", "table");
  });

  it("has default context values if no provider used", () => {
    const { result } = renderHook(() => useLocalStoreContext());
    const [store, setStore] = result.current;

    expect(store.view).toBe("grid");
    expect(typeof setStore).toBe("function");
  });
});
