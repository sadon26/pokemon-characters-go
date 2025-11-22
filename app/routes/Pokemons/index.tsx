import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { IntroWrapper, PokemonList, type PaginateProps } from "~/components";
import { useAxios } from "~/hooks";
import { HomeLayout } from "~/layouts";
import { POKEMONS_URL } from "~/services/paths";

export type Route = {
  MetaArgs: Record<string, unknown>;
};

export type PokemonParams = { offset: number; limit: number };

export function meta({}: Route["MetaArgs"]) {
  return [
    { title: "Pokemon Go App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [pokemonsParams, setPokemonParams] = useState<PokemonParams>({
    limit: 12,
    offset: 0,
  });
  const {
    loading: loadingPokemon,
    error: errorPokemons,
    data: pokemonsData,
    API,
  } = useAxios();
  const { pathname, state } = useLocation();

  const refetchPaginatedPokemons = async ({ selected }: PaginateProps) => {
    const offset = selected * pokemonsParams.limit;
    await API.getPokemons({ ...pokemonsParams, offset });

    if (!errorPokemons) {
      setPokemonParams((prev) => ({ ...prev, offset }));
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    API.getPokemons(pokemonsParams);

    if (pathname === "/" && state?.from !== POKEMONS_URL) {
      timeout = setTimeout(() => {
        setLoading(false);
      }, 2500);
      return;
    }

    setLoading(false);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return loading ? (
    <IntroWrapper />
  ) : (
    <HomeLayout error={!!errorPokemons}>
      <PokemonList
        loading={loadingPokemon}
        pokemons={pokemonsData}
        params={pokemonsParams}
        onPaginate={refetchPaginatedPokemons}
      />
    </HomeLayout>
  );
}
