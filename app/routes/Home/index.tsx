import { useCallback, useEffect, useState } from "react";
import { Header, IntroWrapper, PokemonList } from "~/components";
import { useAxios } from "~/hooks";

export type Route = {
  MetaArgs: Record<string, unknown>;
};

export function meta({}: Route["MetaArgs"]) {
  return [
    { title: "Pokemon Go App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [pokemonsParams] = useState({ limit: 15, offset: 0 });
  const { loading: loadingPokemon, data: pokemonsData, API } = useAxios();

  useEffect(() => {
    API.getPokemons("pokemon", pokemonsParams);

    setTimeout(() => {
      setLoading(false);
    }, 2500);
  }, []);

  useEffect(() => {
    console.log(pokemonsData, "<><>");
  }, [loadingPokemon]);

  return loading ? (
    <IntroWrapper />
  ) : (
    <div className="max-w-[750px] mx-auto px-6 fade-into">
      <Header />
      <PokemonList loading={loadingPokemon} pokemons={pokemonsData} />
    </div>
  );
}
