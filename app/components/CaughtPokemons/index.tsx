import type { FC } from "react";
import Button from "../Button";

const CaughtPokemons: FC = () => {
  const caughtCount = 0;
  return (
    <Button className="inline-flex items-center gap-2 card-shadow">
      <span
        id="caughtCount"
        className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold"
      >
        {caughtCount}
      </span>
      <span className="text-sm text-slate-600 font-normal">Caught</span>
    </Button>
  );
};

export default CaughtPokemons;
