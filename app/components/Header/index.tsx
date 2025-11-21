import { PokemonLogo } from "~/assets";
import { Button, CaughtPokemons, ViewSwitcher } from "../index";

const Header = () => {
  return (
    <nav className="py-6 flex justify-between">
      <div className="flex items-center gap-2">
        <div className="rounded-full w-10 h-10 animate-spin">
          <img
            src={PokemonLogo}
            alt="logo"
            className="w-full h-full object-cover ring-2 ring-white shadow-sm"
          />
        </div>
        <h1 className="font-bold text-2xl">Pokémon</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button className="export-csv-button">Export CSV</Button>
        <CaughtPokemons />
        <ViewSwitcher />
      </div>
    </nav>
  );
};

export default Header;
