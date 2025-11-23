import * as apis from "../services/apis";
import { useState } from "react";

type TData = any;

type TParams = Record<string, unknown>;

type TResponse = { data: TData };

type API = {
  getPokemons: (params: TParams) => Promise<TData>;
  getPokemon: (id: string, params?: TParams) => Promise<TData>;
};

const useAxios = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TData>();
  const [error, setError] = useState<boolean | unknown>(false);

  const fetchData = async (
    apiCall: () => Promise<TResponse>
  ): Promise<TData> => {
    setLoading(true);
    setError(false);
    try {
      const res = await apiCall();
      setData(res.data);
      return Promise.resolve(res.data);
    } catch (error) {
      setError(true);
      console.error("Error fetching data:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const API: API = {
    getPokemons: async (params: TParams) =>
      (await fetchData(
        () => apis.getPokemons("pokemon", params) as Promise<TResponse>
      )) as TData,
    getPokemon: async (id: string, params?: TParams) =>
      (await fetchData(
        () => apis.getPokemon(`pokemon/${id}`, params) as Promise<TResponse>
      )) as TData,
  };

  return {
    API,
    loading,
    error,
    data,
  };
};

export default useAxios;
