import { type FC } from "react";
import Button from "../Button";
import { useLocalStoreContext } from "~/contexts";
import { POKEMONS_CAUGHT_URL } from "~/services/paths";
import { useLocation, useNavigate } from "react-router";

const CaughtPokemons: FC = () => {
  const [store] = useLocalStoreContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Button
      className={[
        "inline-flex items-center gap-2 card-shadow",
        pathname === POKEMONS_CAUGHT_URL ? "border border-green-800" : "",
      ].join(" ")}
      onClick={() => navigate(POKEMONS_CAUGHT_URL)}
    >
      <span
        id="caughtCount"
        className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold"
      >
        {store.caughtPokemons?.length}
      </span>
      <span
        className={[
          "text-sm text-slate-600 font-normal",
          pathname === POKEMONS_CAUGHT_URL ? "!font-bold !text-green-800" : "",
        ].join(" ")}
      >
        Caught
      </span>
    </Button>
  );
};

export default CaughtPokemons;
