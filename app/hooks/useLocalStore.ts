import { useState } from "react";

export type Key = keyof typeof localKeys;

const initialValue = {
  view: "grid",
  caughtPokemons: [],
  pageLoaded: false,
};

export const localKeys: { [k: string]: string } = Object.keys(
  initialValue
).reduce((acc, curr) => ({ ...acc, [curr]: curr }), {});

const useLocalStore = <T>() => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue as T;
    }

    try {
      const item = window.localStorage.getItem("global");
      return item ? (JSON.parse(item) as T) : (initialValue as T);
    } catch (error) {
      console.warn(`Error reading localStorage key "${"global"}":`, error);
      return initialValue as T;
    }
  });

  const setValue = (key: Key, value: unknown) => {
    try {
      if (typeof window !== "undefined") {
        setStoredValue((prevData) => {
          const newData = { ...prevData, [localKeys[key]]: value };
          window.localStorage.setItem("global", JSON.stringify(newData));
          return newData;
        });
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

export default useLocalStore;
