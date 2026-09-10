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

export interface PipelineConfig {
  resolution: ResolutionConfig;
  adjustments: AdjustmentsConfig;
  dithering: DitheringConfig;
  chromaticAberration: ChromaticAberrationConfig;
  crtEffect: boolean;
}

export interface MediaSource {
  type: 'image' | 'video';
  url: string;
  name: string;
  aspectRatio: number;
}
