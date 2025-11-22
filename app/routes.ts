import { type RouteConfig, index, route } from "@react-router/dev/routes";
import { POKEMONS_CAUGHT_URL } from "./services/paths";

export default [
  index("routes/Pokemons/index.tsx"),
  route("/pokemons/:id", "routes/Pokemon/index.tsx"),
  route(POKEMONS_CAUGHT_URL, "routes/Pokedex/index.tsx"),
] satisfies RouteConfig;
