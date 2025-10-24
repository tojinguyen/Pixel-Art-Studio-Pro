
import { GenerationType, AnimationType, Settings } from './types';

export const PALETTES = {
  "GameBoy": "4 colors: #0f380f, #306230, #8bac0f, #9bbc0f",
  "NES": "16 colors, classic Nintendo Entertainment System palette",
  "SNES": "32 colors, classic Super Nintendo Entertainment System palette",
  "Pico-8": "16 colors: #000000, #1D2B53, #7E2553, #008751, #AB5236, #5F574F, #C2C3C7, #FFF1E8, #FF004D, #FFA300, #FFEC27, #00E436, #29ADFF, #83769C, #FF77A8, #FFCCAA",
  "Custom": ""
};

export const STYLES = ["Fantasy", "Sci-Fi", "Cyberpunk", "Cute", "Chiptune", "Modern", "Horror"];

export const DEFAULT_SETTINGS: Settings = {
  prompt: "A heroic knight character, facing right",
  generationType: GenerationType.Character,
  pixelSize: { width: 32, height: 32 },
  colorPalette: "NES",
  customPalette: "#ff0000, #00ff00, #0000ff, #ffff00",
  style: "Fantasy",
  animation: {
    frameCount: 6,
    animationType: AnimationType.Walk,
    fps: 8,
    loop: true,
  },
};
