import axios from "../../app/services/axios";
import * as apis from "../../app/services/apis";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../app/services/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("apis module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls axios.get with correct URL and params in getPokemons", async () => {
    const mockResponse = { data: { results: [] } };
    (axios.get as vi.Mock).mockResolvedValue(mockResponse);

    const params = { limit: 10, offset: 0 };
    const result = await apis.getPokemons("pokemon", params);

    expect(axios.get).toHaveBeenCalledWith("pokemon", {
      params: { ...params, q: "bulbasaur" },
    });
    expect(result).toEqual(mockResponse);
  });

  it("calls axios.get with correct URL and params in getPokemon", async () => {
    const mockResponse = { data: { name: "Pikachu" } };
    (axios.get as vi.Mock).mockResolvedValue(mockResponse);

    const params = { detail: true };
    const result = await apis.getPokemon("pokemon/25", params);

    expect(axios.get).toHaveBeenCalledWith("pokemon/25", { params });
    expect(result).toEqual(mockResponse);
  });

  it("calls axios.get with undefined params in getPokemon if not provided", async () => {
    const mockResponse = { data: { name: "Bulbasaur" } };
    (axios.get as vi.Mock).mockResolvedValue(mockResponse);

    const result = await apis.getPokemon("pokemon/1");

    expect(axios.get).toHaveBeenCalledWith("pokemon/1", { params: undefined });
    expect(result).toEqual(mockResponse);
  });
});
