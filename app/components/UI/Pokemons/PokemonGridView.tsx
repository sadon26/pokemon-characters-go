import type { FC } from "react";
import ReactPaginate from "react-paginate";
import { TickIcon } from "~/assets";
import type { Pokemons } from "~/components";
import Button from "~/components/Button";
import { useUpdatePokemons } from "~/hooks";

const PokemonGridView: FC<Pokemons> = ({
  pokemons,
  viewPokemon,
  params,
  handlePageClick,
}) => {
  const { hasCaughtPokemon } = useUpdatePokemons();

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {pokemons?.results?.map((pokemon) => (
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
      {pokemons?.count > (params?.limit as number) && (
        <ReactPaginate
          className="react-paginate"
          breakLabel="..."
          forcePage={(params?.offset as number) / (params?.limit as number)}
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          previousLabel="←"
          nextLabel="→"
          pageCount={
            Math.ceil(pokemons?.count / (params?.limit as number)) ?? 0
          }
          renderOnZeroPageCount={null}
        />
      )}
    </div>
  );
};

export default PokemonGridView;
