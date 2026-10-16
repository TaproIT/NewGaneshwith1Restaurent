// src/lib/theme-palettes.ts
export type PaletteId = "classic" | "ocean" | "sunset" | "garden" | "lotus" | "monsoon";

export interface Palette {
  id: PaletteId;
  name: string;
  primary: string;
  secondary: string;
}

// Swatch colours for the theme menu. Keep in sync with the [data-palette] blocks in index.css.
export const PALETTES: Palette[] = [
  { id: "classic", name: "Ganesh Classic", primary: "#0A869D", secondary: "#B24E0E" },
  { id: "ocean", name: "Ocean", primary: "#1C55A0", secondary: "#0B7A7C" },
  { id: "sunset", name: "Sunset", primary: "#A83A1B", secondary: "#6B2C5C" },
  { id: "garden", name: "Garden", primary: "#2D6A35", secondary: "#8A5A00" },
  { id: "lotus", name: "Lotus", primary: "#6A3A9E", secondary: "#A62B62" },
  { id: "monsoon", name: "Monsoon", primary: "#33557F", secondary: "#B14E14" },
];
