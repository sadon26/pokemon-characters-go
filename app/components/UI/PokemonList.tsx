import React, { type FC } from "react";
import { TickIcon } from "~/assets";
import { useLocalStoreContext } from "~/contexts";
import { Button, PageLoader } from "~/components";
import { useUpdatePokemons } from "~/hooks";
import { useNavigate } from "react-router";
import { POKEMON_URL } from "~/services/paths";
import ReactPaginate from "react-paginate";
import type { PokemonParams } from "~/routes/Pokemons";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  pokemons: {
    results: PokemonResult[];
  };
  loading: boolean;
  params?: PokemonParams;
  onPaginate: (data: PaginateProps) => void;
};

export type PokemonResult = { name: string; url: string };

export type Pokemons = {
  pokemons: Props["pokemons"];
  viewPokemon: (data: PokemonResult) => void;
  params?: PokemonParams;
  handlePageClick: (data: PaginateProps) => void;
};

export type PaginateProps = { selected: number };

const TableView: FC<Pokemons> = ({
  pokemons,
  viewPokemon,
  params,
  handlePageClick,
}) => {
  const { hasCaughtPokemon } = useUpdatePokemons();

  return (
    <>
      <table className="w-full table-auto border-collapse border border-slate-300 mb-6">
        <thead>
          <tr>
            <th className="border border-slate-300 px-4 py-2 text-left">
              Name
            </th>
            <th className="border border-slate-300 px-4 py-2 text-left">URL</th>
            <th className="border border-slate-300 px-4 py-2 text-left">
              Caught Pokémons
            </th>
            <th className="border border-slate-300 px-4 py-2 text-left">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {pokemons.results.map((pokemon) => (
            <tr key={pokemon.name}>
              <td className="border border-slate-300 px-4 py-2 capitalize">
                {pokemon.name}
              </td>
              <td className="border border-slate-300 px-4 py-2">
                {pokemon.url}
              </td>
              <td className="border border-slate-300 px-4 py-2">
                {hasCaughtPokemon(pokemon) && (
                  <div className="flex justify-center">
                    <div className="flex items-center pointer-events-none">
                      <span className="text-xs">Caught</span>
                      <div className="w-6 h-6 bg-white/90 rounded-full p-1 shadow-sm">
                        <img src={TickIcon} alt="tick-icon" />
                      </div>
                    </div>
                  </div>
                )}
              </td>
              <td className="flex justify-between border border-slate-300 px-4 py-2">
                <Button
                  className="!py-1 !px-2 !text-xs !h-8 rounded-lg border text-sm"
                  onClick={() => viewPokemon(pokemon)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pokemons?.count > params.limit && (
        <ReactPaginate
          className="react-paginate"
          forcePage={(params?.offset as number) / (params?.limit as number)}
          breakLabel="..."
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={
            Math.ceil(pokemons?.count / (params?.limit as number)) ?? 0
          }
          renderOnZeroPageCount={null}
        />
      )}
    </>
  );
};

const GridView: FC<Pokemons> = ({
  pokemons,
  viewPokemon,
  params,
  handlePageClick,
}) => {
  const { hasCaughtPokemon } = useUpdatePokemons();

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {pokemons.results.map((pokemon) => (
          <div
            key={pokemon.name}
            className="border border-slate-300 rounded-lg p-4 flex flex-col justify-between items-center hover:shadow-lg transition-all"
          >
            <p
              className={[
                "capitalize",
                hasCaughtPokemon(pokemon) ? "font-bold" : "",
              ].join(" ")}
            >
              {pokemon.name}
            </p>
            {hasCaughtPokemon(pokemon) && (
              <div className="flex justify-center">
                <Button className="flex items-center pointer-events-none">
                  <span className="text-xs">Caught</span>
                  <div className="w-6 h-6 bg-white/90 rounded-full p-1 shadow-sm">
                    <img src={TickIcon} alt="tick-icon" />
                  </div>
                </Button>
              </div>
            )}
            <div className="mt-6 flex justify-between w-full">
              <Button
                className="px-3 py-1 w-full rounded-lg border text-sm"
                onClick={() => viewPokemon(pokemon)}
              >
                View
              </Button>
            </div>
          </div>
        ))}
      </div>
      {pokemons?.count > params?.limit && (
        <ReactPaginate
          className="react-paginate"
          breakLabel="..."
          forcePage={(params?.offset as number) / (params?.limit as number)}
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={
            Math.ceil(pokemons?.count / (params?.limit as number)) ?? 0
          }
          renderOnZeroPageCount={null}
        />
      )}
    </div>
  );
};

const PokemonList: FC<Props> = ({ pokemons, loading, params, onPaginate }) => {
  const [store] = useLocalStoreContext();

  const navigate = useNavigate();

  const viewPokemon = async (pokemon: PokemonResult) => {
    const pokemonID = pokemon.url.split("/").at(-2) as string;
    navigate(POKEMON_URL(pokemonID));
  };

  const handlePageClick = (data: PaginateProps) => {
    onPaginate(data);
  };

  return (
    <>
      {loading ? (
        <PageLoader />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={store?.view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {store.view === "grid" ? (
              <GridView
                pokemons={pokemons}
                viewPokemon={viewPokemon}
                params={params}
                handlePageClick={handlePageClick}
              />
            ) : (
              <TableView
                pokemons={pokemons}
                viewPokemon={viewPokemon}
                params={params}
                handlePageClick={handlePageClick}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export default PokemonList;
