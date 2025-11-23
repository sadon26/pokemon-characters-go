import type { FC } from "react";
import ReactPaginate from "react-paginate";
import { TickIcon } from "~/assets";
import type { Pokemons } from "~/components";
import Button from "~/components/Button";
import { useUpdatePokemons } from "~/hooks";

const PokemonTableView: FC<Pokemons> = ({
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
          {pokemons?.results?.map((pokemon) => (
            <tr key={pokemon.name}>
              <td className="border border-slate-300 px-4 py-2 text-sm capitalize">
                {pokemon.name}
              </td>
              <td className="border border-slate-300 px-4 py-2 text-sm">
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
      {pokemons?.count > (params?.limit as number) && (
        <ReactPaginate
          className="react-paginate"
          forcePage={(params?.offset as number) / (params?.limit as number)}
          breakLabel="..."
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          pageCount={
            Math.ceil(pokemons?.count / (params?.limit as number)) ?? 0
          }
          renderOnZeroPageCount={null}
        />
      )}
    </>
  );
};

export default PokemonTableView;
