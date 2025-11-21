import type { FC } from "react";
import { RippleLoader } from "~/assets";
import { useLocalStoreContext } from "~/contexts";

type Props = {
  pokemons: {
    results: { name: string; url: string }[];
  };
  loading: boolean;
};

type Pokemons = { pokemons: Props["pokemons"] };

const TableView: FC<Pokemons> = ({ pokemons }) => (
  <table className="w-full table-auto border-collapse border border-slate-300">
    <thead>
      <tr>
        <th className="border border-slate-300 px-4 py-2 text-left">Name</th>
        <th className="border border-slate-300 px-4 py-2 text-left">URL</th>
      </tr>
    </thead>
    <tbody>
      {pokemons.results.map((pokemon) => (
        <tr key={pokemon.name}>
          <td className="border border-slate-300 px-4 py-2">{pokemon.name}</td>
          <td className="border border-slate-300 px-4 py-2">{pokemon.url}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const GridViev: FC<Pokemons> = ({ pokemons }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {pokemons.results.map((pokemon) => (
      <div
        key={pokemon.name}
        className="border border-slate-300 rounded-lg p-4 text-center"
      >
        {pokemon.name}
      </div>
    ))}
  </div>
);

const Loader = () => (
  <div className="flex justify-center items-center pt-50">
    <div className="w-24 h-24">
      <img src={RippleLoader} alt="Ripple loader" className="w-full h-full" />
    </div>
  </div>
);

const PokemonList: FC<Props> = ({ pokemons, loading }) => {
  const [store] = useLocalStoreContext();

  return loading ? (
    <Loader />
  ) : store.view === "grid" ? (
    <GridViev pokemons={pokemons} />
  ) : (
    <TableView pokemons={pokemons} />
  );
};

export default PokemonList;
