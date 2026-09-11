import { parseGIF, decompressFrames } from 'gifuct-js';

export interface ParsedGifFrame {
  canvas: HTMLCanvasElement;
  delay: number;
}

export interface DecodedGif {
  width: number;
  height: number;
  frames: ParsedGifFrame[];
}

/**
 * Decodifica um arquivo GIF animado a partir de um ArrayBuffer,
 * recompondo cada frame acumulado e respeitando os métodos de descarte (disposal methods).
 */
export async function decodeGif(arrayBuffer: ArrayBuffer): Promise<DecodedGif> {
  const gif = parseGIF(arrayBuffer);
  const rawFrames = decompressFrames(gif, true);

  if (!rawFrames || rawFrames.length === 0) {
    throw new Error('O arquivo GIF não contém frames válidos.');
  }

  const width = gif.lsd.width;
  const height = gif.lsd.height;

  // Canvas acumulador completo
  const fullCanvas = document.createElement('canvas');
  fullCanvas.width = width;
  fullCanvas.height = height;
  const fullCtx = fullCanvas.getContext('2d', { willReadFrequently: true });
  if (!fullCtx) throw new Error('Não foi possível obter o contexto 2D para o GIF.');

  // Canvas auxiliar para patches de cada frame
  const patchCanvas = document.createElement('canvas');
  const patchCtx = patchCanvas.getContext('2d', { willReadFrequently: true });
  if (!patchCtx) throw new Error('Não foi possível obter o contexto 2D para o patch do GIF.');

  let previousImageData: ImageData | null = null;
  const processedFrames: ParsedGifFrame[] = [];

  for (let i = 0; i < rawFrames.length; i++) {
    const frame = rawFrames[i];
    const dims = frame.dims;

    // Guarda a imagem anterior para Disposal Method 3 (Restore to Previous)
    if (frame.disposalType === 3) {
      previousImageData = fullCtx.getImageData(0, 0, width, height);
    }

    // Desenha o patch do frame atual no patchCanvas
    patchCanvas.width = dims.width;
    patchCanvas.height = dims.height;
    const patchImageData = patchCtx.createImageData(dims.width, dims.height);
    patchImageData.data.set(frame.patch);
    patchCtx.putImageData(patchImageData, 0, 0);

    // Disposal Method 2: Limpa a área do patch anterior para o fundo transparente
    if (frame.disposalType === 2) {
      fullCtx.clearRect(dims.left, dims.top, dims.width, dims.height);
    }

    // Desenha o novo patch no canvas acumulador
    fullCtx.drawImage(patchCanvas, dims.left, dims.top);

    // Congela uma cópia do estado atual do canvas para este frame
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = width;
    frameCanvas.height = height;
    const frameCtx = frameCanvas.getContext('2d');
    if (frameCtx) {
      frameCtx.drawImage(fullCanvas, 0, 0);
    }

    // Define o tempo de atraso (delay). Padrão de 100ms (10 FPS) se delay for 0 ou inválido
    const delay = frame.delay && frame.delay >= 20 ? frame.delay : 100;

    processedFrames.push({
      canvas: frameCanvas,
      delay
    });

    // Restaura o estado anterior para Disposal Method 3
    if (frame.disposalType === 3 && previousImageData) {
      fullCtx.putImageData(previousImageData, 0, 0);
    }
  }

  return {
    width,
    height,
    frames: processedFrames
  };
}
