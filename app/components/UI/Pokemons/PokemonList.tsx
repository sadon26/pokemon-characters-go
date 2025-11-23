import { type FC } from "react";
import { useLocalStoreContext } from "~/contexts";
import { PokemonGridView, PokemonTableView } from "~/components";
import { useNavigate } from "react-router";
import { POKEMON_URL } from "~/services/paths";
import type { PokemonParams } from "~/routes/Pokemons";
import { AnimatePresence, motion } from "framer-motion";
import type { PokemonProps } from "~/routes/Pokemon";

type Props = {
  pokemons: {
    results: PokemonProps["pokemon"][];
    count: number;
  };
  params?: PokemonParams;
  onPaginate: (data: PaginateProps) => void;
};

export type Pokemons = {
  pokemons: Props["pokemons"];
  viewPokemon: (data: PokemonProps["pokemon"]) => void;
  params?: PokemonParams;
  handlePageClick: (data: PaginateProps) => void;
};

export type PaginateProps = { selected: number };

const PokemonList: FC<Props> = ({ pokemons, params, onPaginate }) => {
  const [store] = useLocalStoreContext();

  const navigate = useNavigate();

  const viewPokemon = async (pokemon: PokemonProps["pokemon"]) => {
    const pokemonID = pokemon.url.split("/").at(-2) as string;
    navigate(POKEMON_URL(pokemonID));
  };

  const handlePageClick = (data: PaginateProps) => {
    onPaginate(data);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={store?.view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {store.view === "grid" ? (
            <PokemonGridView
              pokemons={pokemons}
              viewPokemon={viewPokemon}
              params={params}
              handlePageClick={handlePageClick}
            />
          ) : (
            <PokemonTableView
              pokemons={pokemons}
              viewPokemon={viewPokemon}
              params={params}
              handlePageClick={handlePageClick}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default PokemonList;
