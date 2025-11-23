import type { ChangeEvent, Dispatch, FC, SetStateAction } from "react";
import { PokemonLogo, SortDownIcon, SortUpIcon } from "~/assets";
import Button from "~/components/Button";
import { useLocalStoreContext } from "~/contexts";
import type { SortDirection } from "~/routes/Pokedex";
import type { PokemonProps } from "~/routes/Pokemon";

const sortOptions = [
  { label: "Name", value: "name" },
  { label: "Height", value: "height" },
  { label: "Weight", value: "weight" },
  { label: "Timestamp", value: "timestamp" },
];

type Props = {
  updateSorting: (e: ChangeEvent<HTMLSelectElement>) => void;
  sortDirection: SortDirection;
  setSortDirection: Dispatch<SetStateAction<SortDirection>>;
  selectedPokemons: PokemonProps["pokemon"][];
  releaseSelectedPokemons: () => void;
};

const PokedexHeader: FC<Props> = ({
  updateSorting,
  setSortDirection,
  sortDirection,
  selectedPokemons,
  releaseSelectedPokemons,
}) => {
  const [store] = useLocalStoreContext();

  return (
    <div className="flex justify-between items-center mb-4">
      {!!store?.caughtPokemons?.length && (
        <div className="flex flex-col md:flex-row gap-3 justify-between w-full">
          <h4 className="font-bold text-sm md:text-lg flex items-center gap-1">
            <span>My Pokédex</span>
            <div className="w-8 animate-spin">
              <img src={PokemonLogo} alt="pikachu-eating" className="w-full" />
            </div>
          </h4>

          <div className="flex items-center gap-1">
            <select
              className="max-w-[150px] h-full appearance-none p-2 pr-10 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 cursor-pointer text-xs"
              onChange={updateSorting}
            >
              <option value="">Sort</option>
              {sortOptions.map(({ label, value }) => (
                <option value={value}>{label}</option>
              ))}
            </select>

            <Button
              title="Sort up/down"
              aria-label="sort up/down"
              className="border border-gray-300"
              onClick={() =>
                setSortDirection((prev: SortDirection) =>
                  prev === "asc" ? "desc" : "asc"
                )
              }
            >
              <div className="w-6">
                <img
                  src={sortDirection === "asc" ? SortUpIcon : SortDownIcon}
                  alt="sort-icon"
                  className="w-full"
                />
              </div>
            </Button>
            {!!selectedPokemons.length && (
              <Button
                className="border border-green-500 text-green-800! font-bold! text-xs hover:brightness-95 whitespace-nowrap"
                onClick={releaseSelectedPokemons}
              >
                Release {selectedPokemons.length} selected pokémon
                {selectedPokemons.length > 1 ? "s" : ""}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PokedexHeader;
