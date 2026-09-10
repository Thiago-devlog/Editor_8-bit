/**
 * Matriz de Bayer 4x4 normalizada (valores de 0 a 15, divididos por 16 no cálculo)
 */
export const BAYER_MATRIX_4X4: number[][] = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5]
];

/**
 * Matriz de Bayer 8x8 normalizada (valores de 0 a 63, divididos por 64 no cálculo)
 */
export const BAYER_MATRIX_8X8: number[][] = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
];

/**
 * Paletas de cores clássicas para aesthetic retro 8-bit / retro gaming
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export const PALETTE_PRESETS: Record<string, RGBColor[]> = {
  gameboy: [
    { r: 15, g: 56, b: 15 },
    { r: 48, g: 98, b: 48 },
    { r: 139, g: 172, b: 15 },
    { r: 155, g: 188, b: 15 }
  ],
  cga: [
    { r: 0, g: 0, b: 0 },
    { r: 85, g: 255, b: 255 },
    { r: 255, g: 85, b: 255 },
    { r: 255, g: 255, b: 255 }
  ],
  cyberpunk: [
    { r: 10, g: 10, b: 26 },
    { r: 255, g: 0, b: 128 },
    { r: 0, g: 240, b: 255 },
    { r: 255, g: 230, b: 0 },
    { r: 255, g: 255, b: 255 }
  ],
  vaporwave: [
    { r: 40, g: 10, b: 55 },
    { r: 255, g: 113, b: 206 },
    { r: 1, g: 205, b: 254 },
    { r: 5, g: 255, b: 161 },
    { r: 185, g: 103, b: 255 }
  ]
};
