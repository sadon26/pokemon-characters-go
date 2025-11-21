import { useState } from "react";

export type Key = keyof typeof localKeys;

export const localKeys: { [k: string]: string } = {
  view: "view",
};

const initialValue = {
  view: "grid",
};

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
    console.log(storedValue, "<><>stored");

    try {
      const newItem = { ...storedValue };
      newItem[localKeys[key]] = value;

      if (typeof window !== "undefined") {
        window.localStorage.setItem("global", JSON.stringify(newItem));
        setStoredValue(newItem);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

export default useLocalStore;
