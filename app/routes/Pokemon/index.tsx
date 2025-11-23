import { useEffect, useRef } from "react";
import { useNavigate, useParams, type To } from "react-router";
import {
  Button,
  PokemonActions,
  PokemonInfoHeader,
  PokemonSkills,
} from "~/components";
import { useAxios } from "~/hooks";
import { HomeLayout } from "~/layouts";
import { POKEMONS_URL } from "~/services/paths";

export type PokemonProps = {
  pokemon: {
    url: string;
    timestamp: string;
    id: number | string;
    note: string;
    name: string;
    types?: {
      type: { name: string };
    }[];
    sprites: {
      other: {
        "official-artwork": {
          front_default: string;
        };
      };
    };
    order: string;
    height: number;
    weight: number;
    base_experience: number;
    moves: {
      name: string;
    }[];
    abilities: {
      ability: { name: string };
    }[];
    forms: {
      name: string;
    }[];
  };
};

const Pokemon = () => {
  const { id } = useParams();
  const wrapperElement = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    loading: loadingPokemon,
    error: errorPokemon,
    data: pokemonData,
    API,
  } = useAxios();

  useEffect(() => {
    API.getPokemon(id as string);
  }, []);

  return (
    <HomeLayout loading={loadingPokemon} error={!!errorPokemon}>
      <Button
        className="back-btn"
        onClick={() => navigate(-1 as To, { state: { from: POKEMONS_URL } })}
      >
        {"<"} Back
      </Button>
      <div ref={wrapperElement} className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <PokemonInfoHeader pokemon={pokemonData} />

        <hr className="my-6 border-slate-100" />

        <PokemonSkills pokemon={pokemonData} />

        <hr className="border-slate-100 my-6" />

        <PokemonActions pokemon={pokemonData} />
      </div>
    </HomeLayout>
  );
};

export default Pokemon;
