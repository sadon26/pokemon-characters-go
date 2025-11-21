import * as apis from "../services/apis";
import { useState } from "react";

type TData = unknown;

type TParams = Record<string, unknown>;

type TResponse = { data: TData };

type API = {
  getPokemons: (url: string, params: TParams) => Promise<TData>;
};

const useAxios = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<boolean | unknown>(false);

  const fetchData = async (
    apiCall: () => Promise<TResponse>
  ): Promise<TData | undefined> => {
    setLoading(true);
    setError(false);
    try {
      const res = await apiCall();
      setData(res.data);
      return Promise.resolve(res.data);
    } catch (error) {
      setError(true);
      console.error("Error fetching data:", error);

      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const API: API = {
    getPokemons: async (url: string, params: TParams) =>
      (await fetchData(
        () => apis.getPokemons(url, params) as Promise<TResponse>
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
