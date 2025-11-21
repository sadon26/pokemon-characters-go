import axios from "./axios";

export const getPokemons = (url: string, params: Record<string, any>) =>
  axios.get(url, { params });
