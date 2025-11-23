import type { FC } from "react";
import { PokemonLogo } from "~/assets";
import type { PokemonProps } from "~/routes/Pokemon";

const PokemonInfoHeader: FC<PokemonProps> = ({ pokemon }) => (
  <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
    <div>
      <h1 className="capitalize text-3xl sm:text-4xl font-extrabold leading-tight">
        {pokemon?.name}
      </h1>
      <div className="text-sm text-slate-500 mt-1">No. {pokemon?.order}</div>

      <div className="mt-4 flex items-center gap-3">
        <p className="text-sm">Types:</p>
        {pokemon?.types?.map(({ type }) => (
          <span
            key={type.name}
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold capitalize border
                  `}
            aria-label={type.name}
          >
            {type.name}
          </span>
        ))}
      </div>
    </div>

    {/* Artwork */}
    <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-lg bg-white/80 flex items-center justify-center shadow-lg">
      <img
        src={pokemon?.sprites?.other?.["official-artwork"]?.front_default}
        alt={`artwork`}
        className="max-w-full max-h-full object-contain"
        loading="eager"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = PokemonLogo;
        }}
      />
    </div>
  </header>
);

export default PokemonInfoHeader;
