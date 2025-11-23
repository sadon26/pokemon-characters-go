import { useEffect, useState } from "react";
import Button from "../Button";
import { useLocalStoreContext } from "~/contexts";
import { localKeys } from "~/hooks/useLocalStore";

const ViewSwitcher = () => {
  const [store, setStore] = useLocalStoreContext();

  return (
    <Button
      className="p-1! md:p-2! bg-white rounded-lg card-shadow"
      id="toggleViewBtn"
      aria-label="toggle-view-button"
      title="Toggle grid / table"
      onClick={() =>
        setStore(localKeys.view, store.view === "grid" ? "table" : "grid")
      }
    >
      <svg
        id="toggleIcon"
        data-testid="toggleIcon"
        className="w-5 h-5 text-slate-700"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        {store.view === "grid" ? (
          <>
            <rect x="3" y="3" width="8" height="8" rx="1.5"></rect>
            <rect x="13" y="3" width="8" height="8" rx="1.5"></rect>
            <rect x="3" y="13" width="8" height="8" rx="1.5"></rect>
            <rect x="13" y="13" width="8" height="8" rx="1.5"></rect>
          </>
        ) : (
          <>
            <rect x="3" y="4" width="18" height="3" rx="1.5"></rect>
            <rect x="3" y="10.5" width="18" height="3" rx="1.5"></rect>
            <rect x="3" y="17" width="18" height="3" rx="1.5"></rect>
          </>
        )}
      </svg>
    </Button>
  );
};

export default ViewSwitcher;
