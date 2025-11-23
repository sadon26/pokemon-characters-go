import { PikachuEatingGif } from "~/assets";
import { Button, CaughtPokemons, ViewSwitcher } from "../index";
import { useLocation, useNavigate } from "react-router";
import { POKEMONS_URL } from "~/services/paths";
import { useLocalStoreContext } from "~/contexts";
import { useExportCSV } from "~/hooks";
import type { PokemonProps } from "~/routes/Pokemon";

export type FormattedPokemons =
  | Omit<PokemonProps["pokemon"], "height" | "weight">
  | {
      types: string | undefined;
      height: string;
      weight: string;
    };

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [store] = useLocalStoreContext();
  const { exportAsCSV } = useExportCSV();

  const formattedPokemons = store?.caughtPokemons?.map(
    (p): FormattedPokemons => ({
      id: p.id,
      name: p.name,
      types: p?.types?.map(({ type }) => type.name)?.join(", "),
      height: `${p.height * 10}cm`,
      weight: `${p.weight / 10}kg`,
      timestamp: p?.timestamp,
    })
  ) as FormattedPokemons[];

  return (
    <nav className="py-6 flex justify-between">
      <button
        className="flex items-center gap-2 cursor-pointer"
        onClick={() =>
          navigate(POKEMONS_URL, {
            state: { from: POKEMONS_URL },
          })
        }
      >
        <div className="rounded-full w-10 h-10">
          <img
            src={PikachuEatingGif}
            alt="logo"
            className="w-full h-full object-cover ring-2 ring-white shadow-sm"
          />
        </div>
        <h1 className="font-bold text-2xl">Pokémon</h1>
      </button>

      <div className="flex items-center gap-2">
        <Button
          className="export-csv-button"
          onClick={() =>
            exportAsCSV({
              pokemons: formattedPokemons,
              link: "caught-pokemons",
            })
          }
        >
          Export CSV
        </Button>
        <CaughtPokemons />
        {pathname === POKEMONS_URL && <ViewSwitcher />}
      </div>
    </nav>
  );
};

export default Header;
