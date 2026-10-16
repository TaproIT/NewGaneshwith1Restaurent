// src/context/ThemeContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { PALETTES, type PaletteId } from "@/lib/theme-palettes";

const DEFAULT_PALETTE: PaletteId = "classic";
const PERSON_KEY = "ggh.palette."; // + email: each person's own choice
const ACTIVE_KEY = "ggh.palette.active"; // the signed-in person's palette, applied at start-up to avoid a flash

const isPaletteId = (value: unknown): value is PaletteId =>
  PALETTES.some((p) => p.id === value);

const read = (key: string): PaletteId | null => {
  try {
    const value = localStorage.getItem(key);
    return isPaletteId(value) ? value : null;
  } catch {
    return null;
  }
};

const write = (key: string, value: PaletteId | null) => {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    // Storage unavailable: the choice still applies until the page is reloaded
  }
};

// On reload of a signed-in page, start with that person's palette straight away.
// The login page ("/") always uses Ganesh Classic.
const initialPalette = (): PaletteId => {
  try {
    const signedIn = !!localStorage.getItem("authToken");
    if (signedIn && window.location.pathname !== "/") return read(ACTIVE_KEY) ?? DEFAULT_PALETTE;
  } catch {
    // ignore
  }
  return DEFAULT_PALETTE;
};

interface ThemeContextType {
  palette: PaletteId;
  setPalette: (palette: PaletteId) => void;
  // Call with the signed-in person's email to load their palette, or null on logout
  setOwner: (owner: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  palette: DEFAULT_PALETTE,
  setPalette: () => {},
  setOwner: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [owner, setOwnerState] = useState<string | null>(null);
  const [palette, setPaletteState] = useState<PaletteId>(initialPalette);

  // Apply the palette as <html data-palette="..."> (Ganesh Classic uses the default :root colours)
  useEffect(() => {
    const root = document.documentElement;
    if (palette === DEFAULT_PALETTE) root.removeAttribute("data-palette");
    else root.setAttribute("data-palette", palette);
  }, [palette]);

  const setOwner = useCallback((next: string | null) => {
    setOwnerState(next);
    if (!next) {
      write(ACTIVE_KEY, null);
      setPaletteState(DEFAULT_PALETTE);
      return;
    }
    const saved = read(PERSON_KEY + next) ?? DEFAULT_PALETTE;
    write(ACTIVE_KEY, saved);
    setPaletteState(saved);
  }, []);

  const setPalette = useCallback(
    (next: PaletteId) => {
      setPaletteState(next);
      if (owner) {
        write(PERSON_KEY + owner, next);
        write(ACTIVE_KEY, next);
      }
    },
    [owner]
  );

  return (
    <ThemeContext.Provider value={{ palette, setPalette, setOwner }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
