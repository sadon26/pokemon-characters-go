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
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm text-sm"
        id="add-note !outline-none !min-h-[500px]"
        value={pokemonNote}
        style={{
          minHeight: "300px",
        }}
        onChange={(e) => setPokemonNote(e.target.value)}
      ></textarea>
      <Button
        className="bg-white border text-slate-700"
        onClick={() => onSubmit(pokemonNote)}
      >
        Add Note
      </Button>
    </div>
  );
};

export default PokemonNote;
