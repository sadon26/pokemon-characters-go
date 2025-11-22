import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { useNavigate, useParams } from "react-router";
import { PokemonLogo } from "~/assets";
import { Button, Modal, PokemonNote } from "~/components";
import { useLocalStoreContext } from "~/contexts";
import { useAxios, useUpdatePokemons } from "~/hooks";
import { HomeLayout } from "~/layouts";
import { POKEMONS_URL } from "~/services/paths";

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

const Pokemon = () => {
  const { id } = useParams();
  const [store] = useLocalStoreContext();
  const wrapperElement = useRef<HTMLDivElement>(null);

  const { catchPokemon, removePokemon, hasCaughtPokemon } = useUpdatePokemons();
  const navigate = useNavigate();

  const {
    loading: loadingPokemon,
    error: errorPokemon,
    data: pokemonData,
    API,
  } = useAxios();

  const sharePokemon = useCallback(async () => {
    const targetElement = wrapperElement.current as HTMLDivElement;
  }, []);

  const pokemonCaught = store?.caughtPokemons?.find(
    (p) => p?.id === pokemonData?.id
  );

  useEffect(() => {
    API.getPokemon(id as string);
  }, []);

  return (
    <HomeLayout loading={loadingPokemon} error={!!errorPokemon}>
      <Button
        className="back-btn"
        onClick={() => navigate(-1, { state: { from: POKEMONS_URL } })}
      >
        {"<"} Back
      </Button>
      <div ref={wrapperElement} className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="capitalize text-3xl sm:text-4xl font-extrabold leading-tight">
              {pokemonData?.name}
            </h1>
            <div className="text-sm text-slate-500 mt-1">
              No. {pokemonData?.order}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <p className="text-sm">Types:</p>
              {pokemonData?.types?.map(
                ({ type }: { type: { name: string } }) => (
                  <span
                    key={type.name}
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold capitalize border
                  `}
                    aria-label={type.name}
                  >
                    {type.name}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Artwork */}
          <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-lg bg-white/80 flex items-center justify-center shadow-lg">
            <img
              src={
                pokemonData?.sprites?.other?.["official-artwork"]?.front_default
              }
              alt={`artwork`}
              className="max-w-full max-h-full object-contain"
              loading="eager"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = PokemonLogo;
              }}
            />
          </div>
        </header>

        <hr className="my-6 border-slate-100" />

        {/* Physical stats */}
        <section
          aria-labelledby="physical-stats"
          className="grid grid-cols-2 gap-6 mb-6"
        >
          <div>
            <div className="text-sm text-slate-500">Height</div>
            <div className="text-2xl font-semibold mt-1">
              {pokemonData?.height * 10}cm
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Weight</div>
            <div className="text-2xl font-semibold mt-1">
              {pokemonData?.weight / 10}kg
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
                    {pokemonData?.base_experience}
                  </div>
                </div>
                <StatBar
                  value={pokemonData?.base_experience}
                  max={100}
                  ariaLabel="Base expoerience"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Optional note & caught timestamp */}
        {
          <section className="mb-6 flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              {
                <div className="flex-1">
                  <div className="text-sm text-slate-500">Moves</div>
                  <p className="mt-2 text-slate-800 capitalize">
                    {pokemonData?.moves?.length
                      ? pokemonData?.moves
                          ?.map(({ move }) => move.name)
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
                  <div className="text-sm text-slate-500">Abilities</div>
                  <p className="mt-2 text-slate-800 capitalize">
                    {pokemonData?.abilities?.length
                      ? pokemonData?.abilities
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
                    {pokemonData?.forms?.length
                      ? pokemonData?.forms?.map(({ name }) => name).join(", ")
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
        }

        <hr className="border-slate-100 my-6" />

        {/* Actions */}
        <footer className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
          <div className="flex gap-2">
            <Button
              className="bg-red-500 text-white font-semibold hover:brightness-95"
              onClick={sharePokemon}
            >
              Share
            </Button>
            {hasCaughtPokemon(pokemonData) ? (
              <Button
                className="border bg-red text-white text-sm capitalize"
                onClick={() => removePokemon(pokemonData)}
              >
                Remove {pokemonData?.name}
              </Button>
            ) : (
              <Button
                className="border capitalize"
                onClick={() => catchPokemon(pokemonData)}
              >
                Catch {pokemonData?.name}
              </Button>
            )}
          </div>
        </footer>
      </div>
    </HomeLayout>
  );
};

export default Pokemon;
