import type { CSSProperties } from "react";

export type MaterialReflectivity = "matte" | "satin" | "gloss" | "mixed";

export type MaterialState = {
  id: string;
  collection?: string;
  field: string;
  accent: string;
  glaze: string;
  clay: string;
  depth: string;
  ink: string;
  accentInk: string;
  reflectivity: MaterialReflectivity;
  pressure: number;
  sheen: number;
};

const neutral: MaterialState = {
  id: "neutral",
  field: "#ece9df",
  accent: "#6d6a62",
  glaze: "#77746d",
  clay: "#8f674e",
  depth: "#343634",
  ink: "#161817",
  accentInk: "#f5f2ea",
  reflectivity: "matte",
  pressure: 0.06,
  sheen: 0.05
};

const states: Record<string, MaterialState> = {
  nebula: {
    id: "nebula",
    collection: "Nebula",
    field: "#e5dfd8",
    accent: "#58627f",
    glaze: "#596886",
    clay: "#9b6146",
    depth: "#303646",
    ink: "#191a1d",
    accentInk: "#f8f1e8",
    reflectivity: "mixed",
    pressure: 0.17,
    sheen: 0.17
  },
  midnight: {
    id: "midnight",
    collection: "Midnight",
    field: "#e1dfd9",
    accent: "#222627",
    glaze: "#31706d",
    clay: "#955b42",
    depth: "#181a1b",
    ink: "#151718",
    accentInk: "#f5f1e8",
    reflectivity: "gloss",
    pressure: 0.2,
    sheen: 0.24
  },
  ocean: {
    id: "ocean",
    collection: "Ocean",
    field: "#e1e5e3",
    accent: "#466f79",
    glaze: "#4f7483",
    clay: "#8d593f",
    depth: "#2d3c42",
    ink: "#172025",
    accentInk: "#eff6f2",
    reflectivity: "satin",
    pressure: 0.15,
    sheen: 0.14
  },
  foggy: {
    id: "foggy",
    collection: "Foggy",
    field: "#e7e4dd",
    accent: "#73736d",
    glaze: "#85847d",
    clay: "#9a664e",
    depth: "#42433f",
    ink: "#20211f",
    accentInk: "#f5f2ea",
    reflectivity: "satin",
    pressure: 0.09,
    sheen: 0.1
  },
  lazuli: {
    id: "lazuli",
    collection: "Lazuli",
    field: "#e2e6e9",
    accent: "#355f86",
    glaze: "#376b98",
    clay: "#8c5a42",
    depth: "#21384d",
    ink: "#18232d",
    accentInk: "#f1f5f6",
    reflectivity: "gloss",
    pressure: 0.16,
    sheen: 0.2
  },
  seaweed: {
    id: "seaweed",
    collection: "Seaweed",
    field: "#e4e3d9",
    accent: "#5d694f",
    glaze: "#637455",
    clay: "#8d5b43",
    depth: "#313b2e",
    ink: "#1e241d",
    accentInk: "#f3f3e9",
    reflectivity: "mixed",
    pressure: 0.13,
    sheen: 0.14
  },
  "latte-foam": {
    id: "latte-foam",
    collection: "Latte Foam",
    field: "#ece5da",
    accent: "#9e8367",
    glaze: "#b49a7b",
    clay: "#8d5d46",
    depth: "#594b40",
    ink: "#2b2521",
    accentInk: "#fbf7ef",
    reflectivity: "satin",
    pressure: 0.08,
    sheen: 0.1
  }
};

function keyFor(collection?: string) {
  return collection?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") ?? "";
}

export function materialStateForCollection(collection?: string): MaterialState {
  return states[keyFor(collection)] ?? neutral;
}

export function materialStateCssVars(collection?: string): CSSProperties {
  const state = materialStateForCollection(collection);

  return {
    "--material-field": state.field,
    "--material-accent": state.accent,
    "--material-glaze": state.glaze,
    "--material-clay": state.clay,
    "--material-depth": state.depth,
    "--material-ink": state.ink,
    "--material-accent-ink": state.accentInk,
    "--material-pressure": String(state.pressure),
    "--material-pressure-mix": `${Math.round(state.pressure * 100)}%`,
    "--material-sheen": String(state.sheen)
  } as CSSProperties;
}

export const materialStates = Object.values(states);
