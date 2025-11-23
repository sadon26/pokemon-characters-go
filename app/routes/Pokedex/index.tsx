import { useCallback, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { NoCaughtPokemonsGif } from "~/assets";
import {
  Button,
  Modal,
  PokedexCharacters,
  PokedexHeader,
  PokemonNote,
} from "~/components";
import { useLocalStoreContext } from "~/contexts";
import { localKeys } from "~/hooks/useLocalStore";
import { HomeLayout } from "~/layouts";
import type { PokemonProps } from "../Pokemon";

export type SortOptionsValues = "name" | "height" | "timestamp" | "weight" | "";

export type SortDirection = "asc" | "desc";

const PokemonsCaught = () => {
  const [store, setStore] = useLocalStoreContext();
  const navigate = useNavigate();
  const [selectedPokemons, setSelectedPokemons] = useState<
    PokemonProps["pokemon"][]
  >([]);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [sortBy, setSortBy] = useState<SortOptionsValues>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPokemonItem, setSelectedPokemonItem] = useState<
    PokemonProps["pokemon"] | Record<string, any>
  >({});

  const addPokemonToNote = (pokemonNote: string) => {
    const checkedIndex: number | undefined = store?.caughtPokemons?.findIndex(
      (p) => p.id === selectedPokemonItem.id
    );

    if (checkedIndex !== -1) {
      let newCaughtPokemons = [...(store?.caughtPokemons ?? [])];
      newCaughtPokemons.splice(checkedIndex as number, 1, {
        ...selectedPokemonItem,
        note: pokemonNote,
      } as PokemonProps["pokemon"]);

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

  const sortedPokemons = useCallback((): Array<PokemonProps["pokemon"]> => {
    const sorter = (a: string | number, b: string | number): number => {
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

  const updateSorting = (e: ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOptionsValues);
  };

  const pokemonSelected = useCallback(
    (pokemon: PokemonProps["pokemon"]) => {
      return !!selectedPokemons?.find((p) => p.id === pokemon.id);
    },
    [store?.caughtPokemons, selectedPokemons]
  );

  const updatePokemonSelections = useCallback(
    (pokemon: PokemonProps["pokemon"]) => {
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

      <PokedexHeader
        updateSorting={updateSorting}
        setSortDirection={setSortDirection}
        sortDirection={sortDirection}
        selectedPokemons={selectedPokemons}
        releaseSelectedPokemons={releaseSelectedPokemons}
      />

      <div>
        {store?.caughtPokemons?.length ? (
          <PokedexCharacters
            sortBy={sortBy}
            sortDirection={sortDirection}
            sortedPokemons={sortedPokemons}
            pokemonSelected={pokemonSelected}
            updatePokemonSelections={updatePokemonSelections}
            setShowModal={setShowModal}
            setSelectedPokemonItem={setSelectedPokemonItem}
          />
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
              GOODLUCK CATCHING ME!
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
