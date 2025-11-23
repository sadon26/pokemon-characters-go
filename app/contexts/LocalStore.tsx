import {
  createContext,
  useContext,
  type Context,
  type FC,
  type PropsWithChildren,
} from "react";
import { useLocalStore } from "~/hooks";
import type { Key } from "~/hooks/useLocalStore";
import type { PokemonProps } from "~/routes/Pokemon";

type Props = {
  children: PropsWithChildren["children"];
};

type StoreProps = {
  view: "grid" | "table";
  caughtPokemons?: PokemonProps["pokemon"][];
  pageLoaded?: boolean;
};

type LocalStoreContextType = [StoreProps, (key: Key, value: unknown) => void];

const LocalStoreContext = createContext<LocalStoreContextType>([
  {
    view: "grid",
  },
  () => {},
]);

export const LocalStore: FC<Props> = ({ children }) => {
  const [store, setStore] = useLocalStore();

  return (
    <LocalStoreContext.Provider value={[store as StoreProps, setStore]}>
      {children}
    </LocalStoreContext.Provider>
  );
};

export const useLocalStoreContext = () =>
  useContext(LocalStoreContext as Context<LocalStoreContextType>);
