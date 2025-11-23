import { useEffect, useState } from "react";
import { IntroWrapper, PokemonList, type PaginateProps } from "~/components";
import { useLocalStoreContext } from "~/contexts";
import { useAxios } from "~/hooks";
import { localKeys } from "~/hooks/useLocalStore";
import { HomeLayout } from "~/layouts";

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
  const [store, setStore] = useLocalStoreContext();

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

    if (!store.pageLoaded) {
      timeout = setTimeout(() => {
        setStore(localKeys.pageLoaded, true);
      }, 2500);
      return;
    }

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return !store.pageLoaded ? (
    <IntroWrapper />
  ) : (
    <HomeLayout loading={loadingPokemon} error={!!errorPokemons}>
      <PokemonList
        pokemons={pokemonsData}
        params={pokemonsParams}
        onPaginate={refetchPaginatedPokemons}
      />
    </HomeLayout>
  );
}
