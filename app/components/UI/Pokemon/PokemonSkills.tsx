import type { FC } from "react";
import { useLocalStoreContext } from "~/contexts";
import type { PokemonProps } from "~/routes/Pokemon";

const PokemonSkills: FC<PokemonProps> = ({ pokemon }) => {
  const [store] = useLocalStoreContext();

  const pokemonCaught = store?.caughtPokemons?.find(
    (p) => p?.id === pokemon?.id
  );

  return (
    <>
      {/* Physical stats */}
      <section
        aria-labelledby="physical-stats"
        className="grid grid-cols-2 gap-6 mb-6"
      >
        <div>
          <div className="text-sm text-slate-500">Height</div>
          <div className="text-2xl font-semibold mt-1">
            {pokemon?.height * 10}cm
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-500">Weight</div>
          <div className="text-2xl font-semibold mt-1">
            {pokemon?.weight / 10}kg
          </div>
        </div>
      </section>

      {/* Stats table */}
      <section aria-labelledby="base-stats" className="mb-6">
        <h2
          id="base-stats"
          className="text-sm text-slate-600 font-semibold mb-3"
        >
          Base Stats
        </h2>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">Stat label</div>
                <div className="text-lg font-medium">
                  {pokemon?.base_experience}
                </div>
              </div>
              <StatBar
                value={pokemon?.base_experience}
                max={100}
                ariaLabel="Base expoerience"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          {
            <div className="flex-1">
              <div className="text-sm text-slate-500">Moves</div>
              <p className="mt-2 text-slate-800 capitalize">
                {pokemon?.moves?.length
                  ? pokemon?.moves?.map(({ move }) => move.name).join(", ")
                  : "..."}
                .
              </p>
            </div>
          }
        </div>

        <div className="flex items-center justify-between gap-4">
          {
            <div className="flex-1">
              <div className="text-sm text-slate-500">Abilities</div>
              <p className="mt-2 text-slate-800 capitalize">
                {pokemon?.abilities?.length
                  ? pokemon?.abilities
                      ?.map(({ ability }) => ability.name)
                      .join(", ")
                  : "..."}
                .
              </p>
            </div>
          }
        </div>

        <div className="flex items-center justify-between gap-4">
          {
            <div className="flex-1">
              <div className="text-sm text-slate-500">Forms</div>
              <p className="mt-2 text-slate-800 capitalize">
                {pokemon?.forms?.length
                  ? pokemon?.forms?.map(({ name }) => name).join(", ")
                  : "..."}
                .
              </p>
            </div>
          }
        </div>

        <div className="flex items-center justify-between gap-4">
          {
            <div className="flex-1">
              <div className="text-sm text-slate-500">Note</div>
              <div className="mt-2 text-slate-800">
                {(pokemonCaught?.note || "...") ?? "Add note..."}
              </div>
            </div>
          }

          {
            <div className="text-right text-sm text-slate-500">
              <div>Added to Pokédex</div>
              <div className="mt-1 text-slate-700">
                {pokemonCaught?.timestamp ?? "..."}
              </div>
            </div>
          }
        </div>
      </section>
    </>
  );
};

type StatBarProps = { value: number; max?: number; ariaLabel?: string };

const StatBar: FC<StatBarProps> = ({ value, max = 255, ariaLabel }) => {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  return (
    <div className="w-full">
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel}
        className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"
      >
        <div
          style={{ width: `${pct}%` }}
          className="h-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-red-400"
        />
      </div>
    </div>
  );
};

export default PokemonSkills;
