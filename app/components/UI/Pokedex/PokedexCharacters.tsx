import { motion } from "framer-motion";
import type { Dispatch, FC, SetStateAction } from "react";
import { useNavigate } from "react-router";
import { PokemonLogo } from "~/assets";
import Button from "~/components/Button";
import type { SortDirection, SortOptionsValues } from "~/routes/Pokedex";
import type { PokemonProps } from "~/routes/Pokemon";
import { POKEMON_URL } from "~/services/paths";

type Props = {
  sortBy: SortOptionsValues;
  sortDirection: SortDirection;
  sortedPokemons: () => Array<PokemonProps["pokemon"]>;
  pokemonSelected: (pokemon: PokemonProps["pokemon"]) => boolean;
  updatePokemonSelections: (pokemon: PokemonProps["pokemon"]) => void;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setSelectedPokemonItem: Dispatch<
    SetStateAction<PokemonProps["pokemon"] | Record<string, any>>
  >;
};

const PokedexCharacters: FC<Props> = ({
  sortBy,
  sortDirection,
  sortedPokemons,
  pokemonSelected,
  updatePokemonSelections,
  setShowModal,
  setSelectedPokemonItem,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6"
      layoutDependency={sortBy + sortDirection}
    >
      {sortedPokemons()?.map((pokemon) => (
        <motion.div
          layout
          key={pokemon.id}
          transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
          className={[
            "border border-slate-300 rounded-lg p-4 flex flex-col justify-between items-center hover:shadow-lg transition-all",
            pokemonSelected(pokemon) ? "!border-red-400" : "",
          ].join(" ")}
        >
          <div className="w-full flex justify-between">
            <h5 className="font-bold capitalize text-sm">{pokemon.name}</h5>

            <Button
              className={[
                `inline-block !px-4 !py-2 !h-8 !rounded-lg !text-xs font-semibold capitalize border`,
                pokemonSelected(pokemon) ? "!border-red-400 !text-red-400" : "",
              ].join(" ")}
              onClick={() => updatePokemonSelections(pokemon)}
            >
              {pokemonSelected(pokemon) ? "Unselect" : "Select"}
            </Button>
          </div>

          <div className="w-44 h-44 sm:w-56 sm:h-56">
            <img
              src={pokemon?.sprites?.other?.["official-artwork"]?.front_default}
              alt="artwork"
              className="max-w-full max-h-full object-contain"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = PokemonLogo;
              }}
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <div className="text-xs">
              <p className="font-bold">Date added</p>
              <span>{pokemon?.timestamp}</span>
            </div>

            <div className="flex justify-between">
              <div className="text-xs">
                <p className="font-bold">Height</p>
                <span>{pokemon?.height * 10}cm</span>
              </div>
              <div className="text-xs flex flex-col">
                <p className="font-bold">Weight</p>
                <span className="self-end">{pokemon?.weight / 10}kg</span>
              </div>
            </div>

            <div className="text-xs">
              <p className="font-bold">Note</p>
              <span>{pokemon?.note || "..."}</span>
            </div>
          </div>

          <div className="flex justify-between gap-2 w-full">
            <Button
              className="bg-white mt-2 border border-green-400 !text-green-700 !text-xs !py-1 !h-8"
              onClick={() => {
                setShowModal((prev) => !prev);
                setSelectedPokemonItem(pokemon);
              }}
            >
              Add Note
            </Button>

            <Button
              className="bg-white mt-2 border border-green-400 !text-green-700 !text-xs !py-1 !h-8"
              onClick={() => navigate(POKEMON_URL(String(pokemon.id)))}
            >
              View
            </Button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PokedexCharacters;
