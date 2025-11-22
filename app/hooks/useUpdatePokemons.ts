import { useCallback } from "react";
import type { PokemonResult } from "~/components/UI/PokemonList";
import { useLocalStoreContext } from "~/contexts";
import { localKeys } from "./useLocalStore";

const useUpdatePokemons = () => {
  const [store, setStore] = useLocalStoreContext();

  const hasCaughtPokemon = (pokemon: PokemonResult) =>
    !!store?.caughtPokemons?.find((p) => p.name === pokemon?.name);

  const catchPokemon = useCallback(
    (pokemon: PokemonResult) => {
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
    (pokemon: PokemonResult) => {
      const foundPokemonIndex = store?.caughtPokemons?.findIndex(
        (p) => p.name === pokemon.name
      );

      const caughtPokemons = [...(store?.caughtPokemons ?? [])];
      caughtPokemons.splice(foundPokemonIndex, 1);

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
