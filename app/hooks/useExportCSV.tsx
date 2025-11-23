import type { FormattedPokemons } from "~/components/Header";

const useExportCSV = () => {
  const exportAsCSV = ({
    pokemons,
    link,
  }: {
    pokemons: FormattedPokemons[];
    link: string;
  }) => {
    const rows = [...(pokemons ?? [])];
    if (!rows.length) {
      alert("Catch your Pokémons to export");
      return;
    }
    const headers = [
      "id",
      "name",
      "types",
      "height",
      "weight",
      "timestamp",
    ] as const;
    const csv = [headers.join(",")]
      .concat(
        rows.map((r) =>
          headers
            .map((h) => {
              // simple CSV escaping
              const v = (r[h as keyof typeof r] ?? "")
                .toString()
                .replace(/"/g, '""');
              return `"${v}"`;
            })
            .join(",")
        )
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${link}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return { exportAsCSV };
};

export default useExportCSV;
