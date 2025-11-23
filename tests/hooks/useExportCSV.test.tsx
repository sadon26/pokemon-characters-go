import { renderHook } from "@testing-library/react";
import useExportCSV from "../../app/hooks/useExportCSV";
import { vi } from "vitest";

describe("useExportCSV hook", () => {
  const originalCreateElement = document.createElement;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn().mockReturnValue("blob:url");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it("alerts if no pokemons are provided", () => {
    const { result } = renderHook(() => useExportCSV());
    const alertMock = vi.fn();
    global.alert = alertMock;

    result.current.exportAsCSV({ pokemons: [], link: "test" });
    expect(alertMock).toHaveBeenCalledWith("Catch your Pokémons to export");
  });

  it("creates CSV and triggers download", () => {
    const { result } = renderHook(() => useExportCSV());

    const appendChildMock = vi.fn();
    const clickMock = vi.fn();
    const removeMock = vi.fn();

    const aMock = {
      href: "",
      download: "",
      click: clickMock,
      remove: removeMock,
    };

    document.createElement = vi
      .fn()
      .mockReturnValue(aMock as unknown as HTMLAnchorElement);
    document.body.appendChild = appendChildMock;

    const pokemons = [
      {
        id: 1,
        name: "Pikachu",
        types: "Electric",
        height: 4,
        weight: 60,
        timestamp: "2025-11-23",
      },
    ];

    result.current.exportAsCSV({ pokemons, link: "pokemons" });

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(appendChildMock).toHaveBeenCalledWith(aMock);
    expect(clickMock).toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:url");
    expect(aMock.download).toBe("pokemons.csv");
  });
});
