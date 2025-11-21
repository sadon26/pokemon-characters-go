import {
  createContext,
  useContext,
  type FC,
  type PropsWithChildren,
} from "react";
import { useLocalStore } from "~/hooks";
import type { Key } from "~/hooks/useLocalStore";

type Props = {
  children: PropsWithChildren["children"];
};

type LocalStoreContextType = [
  Record<Key, string>,
  (key: Key, value: unknown) => void,
];

const LocalStoreContext = createContext<LocalStoreContextType>([
  {
    view: "grid",
  },
  () => {},
]);

export const LocalStore: FC<Props> = ({ children }) => {
  const [store, setStore] = useLocalStore();

  return (
    <LocalStoreContext.Provider value={[store, setStore]}>
      {children}
    </LocalStoreContext.Provider>
  );
};

export const useLocalStoreContext = () => useContext(LocalStoreContext);
