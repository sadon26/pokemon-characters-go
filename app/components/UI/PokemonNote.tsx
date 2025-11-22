import { useEffect, useState, type FC } from "react";
import { Button } from "~/components";

type Props = {
  note?: string;
  onSubmit: (value: string) => void;
};

const PokemonNote: FC<Props> = ({ note, onSubmit }) => {
  const [pokemonNote, setPokemonNote] = useState("");

  useEffect(() => {
    if (note) setPokemonNote(note);
  }, []);

  return (
    <div className="mt-6">
      <label htmlFor="add-note" className="block font-bold">
        Add Note
      </label>
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200 shadow-sm text-sm"
        id="add-note !outline-none !min-h-[500px]"
        value={pokemonNote}
        style={{
          minHeight: "300px",
        }}
        onChange={(e) => setPokemonNote(e.target.value)}
      ></textarea>
      <div className="flex gap-3">
        <Button
          className="bg-white border text-slate-700 !text-xs !h-8"
          onClick={() => onSubmit(pokemonNote)}
        >
          Add Note
        </Button>
        <Button
          className="!bg-red-400 !text-white text-slate-700 !text-xs !h-8"
          onClick={() => onSubmit("")}
        >
          Clear Note & Close
        </Button>
      </div>
    </div>
  );
};

export default PokemonNote;
