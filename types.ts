
export enum GenerationType {
  Background = "Background",
  ParallaxLayer = "Parallax Layer",
  Character = "Character",
  Object = "Object / Prop",
  AnimationSheet = "Animation Sheet",
}

export enum AnimationType {
  Idle = "idle",
  Walk = "walk",
  Run = "run",
  Jump = "jump",
  Attack = "attack",
  Death = "death",
}

export interface AnimationSettings {
  frameCount: number;
  animationType: AnimationType;
  fps: number;
  loop: boolean;
}

export interface Settings {
  prompt: string;
  generationType: GenerationType;
  pixelSize: { width: number; height: number };
  colorPalette: string;
  customPalette: string;
  style: string;
  animation: AnimationSettings;
}

export interface GeneratedAsset {
  id: string;
  type: GenerationType;
  data: string; // base64 image data
  prompt: string;
}
