import { DecodedGif } from '../engine/gifDecoder';

export type DitheringAlgorithm = 'bayer4x4' | 'bayer8x8' | 'floydSteinberg' | 'atkinson' | 'none';

export type PalettePreset = 'grayscale' | 'gameboy' | 'cga' | 'cyberpunk' | 'vaporwave' | 'fullColor';

export interface ResolutionConfig {
  enabled: boolean;
  targetHeight: number; // Ex: 144, 180, 240, 360, 480, 720
}

export interface DitheringConfig {
  enabled: boolean;
  algorithm: DitheringAlgorithm;
  colorPaletteSize: number; // 2 a 32 níveis por canal
  preset: PalettePreset;
}

export interface ChromaticAberrationConfig {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
}

export interface AdjustmentsConfig {
  enabled: boolean;
  brightness: number; // -100 a 100
  contrast: number;   // -100 a 100
  saturation: number; // -100 a 100
}

export type AsciiRamp = 'standard' | 'matrix' | 'binary' | 'katakana' | 'custom';

export interface AsciiConfig {
  enabled: boolean;
  fontSize: number;
  ramp: AsciiRamp;
  color: 'source' | string;
  customRamp: string;
  cols: number;
  rows: number;
}

export interface ShaderConfig {
  enabled: boolean;
  curvature: number;
  chromaticAberration: number;
  scanlines: number;
  sweep: number;
}

export interface PipelineConfig {
  resolution: ResolutionConfig;
  adjustments: AdjustmentsConfig;
  dithering: DitheringConfig;
  chromaticAberration: ChromaticAberrationConfig;
  crtEffect: boolean;
  ascii: AsciiConfig;
  shader: ShaderConfig;
}

export interface MediaSource {
  type: 'image' | 'video' | 'gif';
  url: string;
  name: string;
  aspectRatio: number;
  gifData?: DecodedGif;
}
