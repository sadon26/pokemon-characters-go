import { toPng } from "html-to-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, type To } from "react-router";
import {
  Button,
  Modal,
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

  const [dataUrl, setDataUrl] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);

  const {
    loading: loadingPokemon,
    error: errorPokemon,
    data: pokemonData,
    API,
  } = useAxios();

  const sharePokemon = useCallback(async () => {
    if (!wrapperElement.current) return;

    toPng(wrapperElement.current, {
      style: {
        backgroundColor: "white",
        paddingLeft: "50px",
        paddingRight: "50px",
      },
    })
      .then((url) => {
        setDataUrl(url);
        setShowModal(true);
      })
      .catch(console.error);
  }, []);

  const downloadPokemonCard = useCallback(async () => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${pokemonData?.name}-card`;
    link.click();
  }, [pokemonData, dataUrl]);

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
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div ref={wrapperElement}>
          {/* Header */}
          <PokemonInfoHeader pokemon={pokemonData} />

          <hr className="my-6 border-slate-100" />

          <PokemonSkills pokemon={pokemonData} />
        </div>

        <hr className="border-slate-100 my-6" />

        <PokemonActions pokemon={pokemonData} sharePokemon={sharePokemon} />

        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <div>
              <div className="flex justify-center">
                <div className="w-160 h-160">
                  <img
                    src={dataUrl}
                    alt={`${pokemonData?.name}-card`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  className="bg-white mt-2 border border-green-400 !text-green-700 !text-xs !py-1 !h-8"
                  onClick={downloadPokemonCard}
                >
                  Download Image
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </HomeLayout>
  );
};

export default Pokemon;
