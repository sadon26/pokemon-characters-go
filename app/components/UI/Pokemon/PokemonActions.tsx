import { useCallback, type FC } from "react";
import Button from "~/components/Button";
import { useUpdatePokemons } from "~/hooks";
import type { PokemonProps } from "~/routes/Pokemon";

const PokemonAction: FC<PokemonProps> = ({ pokemon }) => {
  const { catchPokemon, removePokemon, hasCaughtPokemon } = useUpdatePokemons();

  const sharePokemon = useCallback(async () => {}, []);

  return (
    <>
      {/* Actions */}
      <footer className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
        <div className="flex gap-2">
          <Button
            className="bg-red-500 text-white font-semibold hover:brightness-95"
            onClick={sharePokemon}
          >
            Share
          </Button>
          {hasCaughtPokemon(pokemon) ? (
            <Button
              className="border bg-red text-white text-sm capitalize"
              onClick={() => removePokemon(pokemon)}
            >
              Remove {pokemon?.name}
            </Button>
          ) : (
            <Button
              className="border capitalize"
              onClick={() => catchPokemon(pokemon)}
            >
              Catch {pokemon?.name}
            </Button>
          )}
        </div>
      </footer>
    </>
  );
};
export default PokemonAction;
