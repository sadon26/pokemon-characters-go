import { renderHook, act } from "@testing-library/react";
import useAxios from "../../app/hooks/useAxios";
import * as apis from "../../app/services/apis";
import { vi } from "vitest";

vi.mock("../../app/services/apis");

describe("useAxios hook", () => {
  const mockData = { results: [{ name: "Pikachu" }] };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches data and sets loading and data states correctly", async () => {
    (apis.getPokemons as vi.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useAxios());

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(false);

    let response;
    await act(async () => {
      response = await result.current.API.getPokemons({});
    });

    expect(apis.getPokemons).toHaveBeenCalledWith("pokemon", {});
    expect(response).toEqual(mockData);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
  });

  it("sets error state when API call fails", async () => {
    const error = new Error("API failed");
    (apis.getPokemons as vi.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useAxios());

    await act(async () => {
      await expect(result.current.API.getPokemons({})).rejects.toThrow(
        "API failed"
      );
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("fetches single pokemon correctly", async () => {
    const singleData = { name: "Bulbasaur" };
    (apis.getPokemon as vi.Mock).mockResolvedValue({ data: singleData });

    const { result } = renderHook(() => useAxios());

    let response;
    await act(async () => {
      response = await result.current.API.getPokemon("1");
    });

    expect(apis.getPokemon).toHaveBeenCalledWith("pokemon/1", undefined);
    expect(response).toEqual(singleData);
    expect(result.current.data).toEqual(singleData);
  });
});
