import { BAYER_MATRIX_4X4, BAYER_MATRIX_8X8, PALETTE_PRESETS, RGBColor } from './ditheringMatrices';
import { AdjustmentsConfig, ChromaticAberrationConfig, DitheringConfig } from '../types/pipeline';

/**
 * Aplica ajustes de Brilho, Contraste e Saturação diretamente no buffer de pixels
 */
export function applyAdjustments(data: Uint8ClampedArray, width: number, height: number, config: AdjustmentsConfig): void {
  if (!config.enabled) return;

  const brightness = config.brightness; // -100 a 100
  const contrast = config.contrast;     // -100 a 100
  const saturation = config.saturation; // -100 a 100

  // Fator de contraste: (255 + C) / (255 - C)
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const satFactor = (saturation + 100) / 100;

  const totalPixels = width * height;
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;

    let r = data[idx];
    let g = data[idx + 1];
    let b = data[idx + 2];

    // 1. Brilho
    if (brightness !== 0) {
      r += brightness;
      g += brightness;
      b += brightness;
    }

    // 2. Contraste
    if (contrast !== 0) {
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;
    }

    // 3. Saturação (Luminância Rec. 709: 0.2126 R + 0.7152 G + 0.0722 B)
    if (saturation !== 0) {
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = gray + satFactor * (r - gray);
      g = gray + satFactor * (g - gray);
      b = gray + satFactor * (b - gray);
    }

    data[idx] = Math.min(255, Math.max(0, r));
    data[idx + 1] = Math.min(255, Math.max(0, g));
    data[idx + 2] = Math.min(255, Math.max(0, b));
  }
}

/**
 * Aplica Aberração Cromática deslocando o canal Vermelho e Azul em direções opostas
 */
export function applyChromaticAberration(data: Uint8ClampedArray, width: number, height: number, config: ChromaticAberrationConfig): void {
  if (!config.enabled || (config.offsetX === 0 && config.offsetY === 0)) return;

  const rx = Math.round(config.offsetX);
  const ry = Math.round(config.offsetY);
  const bx = -rx;
  const by = -ry;

  // Cria uma cópia temporária do buffer para não sobrescrever pixels de leitura
  const copy = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Canal Vermelho (Shift positivo)
      const redX = Math.min(width - 1, Math.max(0, x + rx));
      const redY = Math.min(height - 1, Math.max(0, y + ry));
      const redIdx = (redY * width + redX) * 4;
      data[idx] = copy[redIdx];

      // Canal Azul (Shift negativo)
      const blueX = Math.min(width - 1, Math.max(0, x + bx));
      const blueY = Math.min(height - 1, Math.max(0, y + by));
      const blueIdx = (blueY * width + blueX) * 4;
      data[idx + 2] = copy[blueIdx + 2];
    }
  }
}

/**
 * Encontra a cor mais próxima dentro de uma paleta de cores predefinida
 */
function findClosestColor(r: number, g: number, b: number, palette: RGBColor[]): RGBColor {
  let minDistance = Infinity;
  let closest = palette[0];

  for (let i = 0; i < palette.length; i++) {
    const p = palette[i];
    const dr = r - p.r;
    const dg = g - p.g;
    const db = b - p.b;
    // Distância euclidiana ponderada
    const dist = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;
    if (dist < minDistance) {
      minDistance = dist;
      closest = p;
    }
  }
  return closest;
}

/**
 * Executa Dithering Ordenado (Matrizes de Bayer 4x4 e 8x8)
 */
export function applyBayerDither(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  config: DitheringConfig
): void {
  const is8x8 = config.algorithm === 'bayer8x8';
  const matrix = is8x8 ? BAYER_MATRIX_8X8 : BAYER_MATRIX_4X4;
  const matrixSize = is8x8 ? 8 : 4;
  const matrixDivisor = is8x8 ? 64 : 16;

  const presetPalette = config.preset !== 'grayscale' && config.preset !== 'fullColor' 
    ? PALETTE_PRESETS[config.preset] 
    : null;

  const levels = Math.max(2, config.colorPaletteSize);
  const step = 255 / (levels - 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const bayerVal = (matrix[y % matrixSize][x % matrixSize] / matrixDivisor) - 0.5;
      const thresholdOffset = bayerVal * step;

      let r = Math.min(255, Math.max(0, data[idx] + thresholdOffset));
      let g = Math.min(255, Math.max(0, data[idx + 1] + thresholdOffset));
      let b = Math.min(255, Math.max(0, data[idx + 2] + thresholdOffset));

      if (presetPalette) {
        const closest = findClosestColor(r, g, b, presetPalette);
        data[idx] = closest.r;
        data[idx + 1] = closest.g;
        data[idx + 2] = closest.b;
      } else {
        data[idx] = Math.round(r / step) * step;
        data[idx + 1] = Math.round(g / step) * step;
        data[idx + 2] = Math.round(b / step) * step;
      }
    }
  }
}

/**
 * Executa Dithering de Difusão de Erro de Floyd-Steinberg
 */
export function applyFloydSteinbergDither(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  config: DitheringConfig
): void {
  const levels = Math.max(2, config.colorPaletteSize);
  const step = 255 / (levels - 1);

  const presetPalette = config.preset !== 'grayscale' && config.preset !== 'fullColor' 
    ? PALETTE_PRESETS[config.preset] 
    : null;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        const oldVal = data[idx + c];
        let newVal = 0;

        if (presetPalette) {
          const closest = findClosestColor(data[idx], data[idx + 1], data[idx + 2], presetPalette);
          newVal = c === 0 ? closest.r : c === 1 ? closest.g : closest.b;
        } else {
          newVal = Math.round(oldVal / step) * step;
        }

        data[idx + c] = newVal;
        const error = oldVal - newVal;

        // Difusão de erro (7/16, 3/16, 5/16, 1/16)
        if (x + 1 < width) data[idx + 4 + c] += (error * 7) >> 4;
        if (x - 1 >= 0 && y + 1 < height) data[idx + (width - 1) * 4 + c] += (error * 3) >> 4;
        if (y + 1 < height) data[idx + width * 4 + c] += (error * 5) >> 4;
        if (x + 1 < width && y + 1 < height) data[idx + (width + 1) * 4 + c] += (error * 1) >> 4;
      }
    }
  }
}

/**
 * Executa Dithering de Difusão de Erro de Atkinson (Usado nos Macintoshes clássicos dos anos 80)
 */
export function applyAtkinsonDither(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  config: DitheringConfig
): void {
  const levels = Math.max(2, config.colorPaletteSize);
  const step = 255 / (levels - 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        const oldVal = data[idx + c];
        const newVal = Math.round(oldVal / step) * step;
        data[idx + c] = newVal;

        // Atkinson difunde 1/8 do erro para 6 vizinhos
        const error = (oldVal - newVal) >> 3;

        if (x + 1 < width) data[idx + 4 + c] += error;
        if (x + 2 < width) data[idx + 8 + c] += error;
        if (x - 1 >= 0 && y + 1 < height) data[idx + (width - 1) * 4 + c] += error;
        if (y + 1 < height) data[idx + width * 4 + c] += error;
        if (x + 1 < width && y + 1 < height) data[idx + (width + 1) * 4 + c] += error;
        if (y + 2 < height) data[idx + (width * 2) * 4 + c] += error;
      }
    }
  }
}
