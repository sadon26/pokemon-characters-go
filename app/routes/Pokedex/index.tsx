import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import {
  NoCaughtPokemonsGif,
  PikachuEatingGif,
  PokemonLogo,
  SortDownIcon,
  SortUpIcon,
} from "~/assets";
import { Button, Modal, PokemonNote } from "~/components";
import { useLocalStoreContext } from "~/contexts";
import { localKeys } from "~/hooks/useLocalStore";
import { HomeLayout } from "~/layouts";
import { POKEMON_URL } from "~/services/paths";

const sortOptions = [
  { label: "Name", value: "name" },
  { label: "Height", value: "height" },
  { label: "Weight", value: "weight" },
  { label: "Timestamp", value: "timestamp" },
];

type SortOptionsValues = "name" | "height" | "timestamp" | "weight" | "";

const PokemonsCaught = () => {
  const [store, setStore] = useLocalStoreContext();
  const navigate = useNavigate();
  const [selectedPokemons, setSelectedPokemons] = useState<{ id: number }[]>(
    []
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<SortOptionsValues>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPokemonItem, setSelectedPokemonItem] = useState<
    Record<string, any>
  >({});

  const addPokemonToNote = (pokemonNote: string) => {
    const checkedIndex = store?.caughtPokemons?.findIndex(
      (p) => p.id === selectedPokemonItem.id
    );

    if (checkedIndex !== -1) {
      let newCaughtPokemons = [...(store?.caughtPokemons ?? [])];
      newCaughtPokemons.splice(checkedIndex, 1, {
        ...selectedPokemonItem,
        note: pokemonNote,
      });

      setStore(localKeys.caughtPokemons, newCaughtPokemons);
    }

    setShowModal(false);
  };

  function parseToMilliseconds(dateString: string): number {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format");
    }

    return date.getTime();
  }

  const sortedPokemons = useCallback(() => {
    const sorter = (a, b) => {
      return sortDirection === "asc" ? (a < b ? -1 : 1) : a < b ? 1 : -1;
    };

    switch (sortBy) {
      case "name":
        return [...(store?.caughtPokemons ?? [])]?.sort((a, b) =>
          sorter(a.name?.toLowerCase(), b?.name?.toLowerCase())
        );
      case "height":
        return [...(store?.caughtPokemons ?? [])]?.sort((a, b) =>
          sorter(a.height, b?.height)
        );
      case "weight":
        return [...(store?.caughtPokemons ?? [])]?.sort((a, b) =>
          sorter(a.weight, b?.weight)
        );
      case "timestamp":
        return [...(store?.caughtPokemons ?? [])]?.sort((a, b) =>
          sorter(
            parseToMilliseconds(a.timestamp),
            parseToMilliseconds(b?.timestamp)
          )
        );
      default:
        return [...(store?.caughtPokemons ?? [])]?.sort((a, b) =>
          sorter(a.name?.toLowerCase(), b?.name?.toLowerCase())
        );
    }
  }, [sortBy, sortDirection, store?.caughtPokemons]);

  const updateSorting = (e: { target: { value: SortOptionsValues } }) => {
    setSortBy(e.target.value as SortOptionsValues);
  };

  const pokemonSelected = useCallback(
    (pokemon: { id: number }) => {
      return !!selectedPokemons?.find((p) => p.id === pokemon.id);
    },
    [store?.caughtPokemons, selectedPokemons]
  );

  const updateSelectedPokemons = useCallback(
    (pokemon: { id: number; note?: string }) => {
      const checkedIndex = selectedPokemons.findIndex(
        (p) => p.id === pokemon.id
      );

      if (checkedIndex === -1) {
        let newCaughtPokemons = [...selectedPokemons];
        newCaughtPokemons = [...newCaughtPokemons, pokemon];
        setSelectedPokemons(newCaughtPokemons);
        return;
      }

      let newCaughtPokemons = [...selectedPokemons];
      newCaughtPokemons = newCaughtPokemons?.filter((p) => p.id !== pokemon.id);
      setSelectedPokemons(newCaughtPokemons);
    },
    [store?.caughtPokemons, selectedPokemons]
  );

  const releaseSelectedPokemons = useCallback(() => {
    const newCaughtPokemons = store?.caughtPokemons?.filter((p) => {
      const selectedPokemonIDs = selectedPokemons.map((p) => p.id);
      return !selectedPokemonIDs.includes(p.id);
    });

    setStore(localKeys.caughtPokemons, newCaughtPokemons);
    setSelectedPokemons([]);
  }, [store?.caughtPokemons, selectedPokemons]);

  return (
    <HomeLayout>
      <Button className="back-btn mb-6" onClick={() => navigate(-1)}>
        {"<"} Back
      </Button>

      <div className="flex justify-between items-center mb-4">
        {!!store?.caughtPokemons?.length && (
          <div className="flex justify-between w-full">
            <h4 className="font-bold text-lg flex items-center">
              <span>My Pokédex</span>
              <div className="w-8">
                <img
                  src={PikachuEatingGif}
                  alt="pikachu-eating"
                  className="w-full"
                />
              </div>
            </h4>

            <div className="flex items-center gap-1">
              <select
                className="w-full h-full appearance-none p-2 pr-10 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 cursor-pointer text-xs"
                onChange={(e) => updateSorting(e)}
              >
                <option value="">Sort</option>
                {sortOptions.map(({ label, value }) => (
                  <option value={value}>{label}</option>
                ))}
              </select>

              <Button
                title="Sort up/down"
                className="border border-gray-300"
                onClick={() =>
                  setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
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
                  className="border border-green-500 !text-green-800 !font-bold text-xs font-semibold hover:brightness-95 whitespace-nowrap"
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

      <div>
        {store?.caughtPokemons?.length ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6"
            layoutDependency={sortBy + sortDirection}
          >
            {sortedPokemons(store?.caughtPokemons)?.map((pokemon) => (
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
                  <h5 className="font-bold capitalize text-sm">
                    {pokemon.name}
                  </h5>

                  <Button
                    className={[
                      `inline-block !px-4 !py-2 !h-8 !rounded-lg !text-xs font-semibold capitalize border`,
                      pokemonSelected(pokemon)
                        ? "!border-red-400 !text-red-400"
                        : "",
                    ].join(" ")}
                    onClick={() => updateSelectedPokemons(pokemon)}
                  >
                    {pokemonSelected(pokemon) ? "Unselect" : "Select"}
                  </Button>
                </div>

                <div className="w-44 h-44 sm:w-56 sm:h-56">
                  <img
                    src={
                      pokemon?.sprites?.other?.["official-artwork"]
                        ?.front_default
                    }
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
                    onClick={() => navigate(POKEMON_URL(pokemon.id))}
                  >
                    View
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-100 md:w-150 mb-6">
              <img
                src={NoCaughtPokemonsGif}
                alt="no caught pokemons"
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
            <h4 className="font-bold text-sm md:text-lg">
              No Pokemons caught...
            </h4>
          </div>
        )}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <PokemonNote
            note={selectedPokemonItem?.note}
            onSubmit={addPokemonToNote}
          />
        </Modal>
      )}
    </HomeLayout>
  );
};

export default PokemonsCaught;
