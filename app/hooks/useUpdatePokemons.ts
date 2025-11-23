import { useCallback } from "react";
import { useLocalStoreContext } from "~/contexts";
import { localKeys } from "./useLocalStore";
import type { PokemonProps } from "~/routes/Pokemon";

const useUpdatePokemons = () => {
  const [store, setStore] = useLocalStoreContext();

  const hasCaughtPokemon = (pokemon: PokemonProps["pokemon"]) =>
    !!store?.caughtPokemons?.find((p) => p.name === pokemon?.name);

  const catchPokemon = useCallback(
    (pokemon: PokemonProps["pokemon"]) => {
      const foundPokemon = store?.caughtPokemons?.find(
        (p) => p.name === pokemon.name
      );

      if (foundPokemon) {
        alert(`${pokemon.name} already added!`);
        return;
      }

      const caughtPokemons = [...(store?.caughtPokemons ?? [])];
      caughtPokemons.splice(caughtPokemons.length, 0, {
        ...pokemon,
        timestamp: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`,
      });

      setStore(localKeys.caughtPokemons, [...caughtPokemons]);
    },
    [store?.caughtPokemons]
  );

  const removePokemon = useCallback(
    (pokemon: PokemonProps["pokemon"]) => {
      const foundPokemonIndex = store?.caughtPokemons?.findIndex(
        (p) => p.name === pokemon.name
      );

      const caughtPokemons = [...(store?.caughtPokemons ?? [])];
      caughtPokemons.splice(foundPokemonIndex as number, 1);

      setStore(localKeys.caughtPokemons, caughtPokemons);
    },
    [store?.caughtPokemons]
  );

  return {
    catchPokemon,
    removePokemon,
    hasCaughtPokemon,
  };
};

export default useUpdatePokemons;
