import { PipelineConfig } from '../types/pipeline';
import { DecodedGif } from './gifDecoder';
import {
  applyAdjustments,
  applyChromaticAberration,
  applyBayerDither,
  applyFloydSteinbergDither,
  applyAtkinsonDither
} from './ditheringAlgorithms';

export class VideoPipelineEngine {
  private mediaElement: HTMLVideoElement | HTMLImageElement;
  private isVideo: boolean;
  private gifData?: DecodedGif;

  private displayCanvas: HTMLCanvasElement;
  private displayCtx: CanvasRenderingContext2D;

  private processCanvas: HTMLCanvasElement;
  private processCtx: CanvasRenderingContext2D;

  private configRef: { current: PipelineConfig };
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;

  private currentGifFrameIndex: number = 0;
  private lastGifFrameTime: number = 0;

  constructor(
    mediaElement: HTMLVideoElement | HTMLImageElement,
    displayCanvas: HTMLCanvasElement,
    configRef: { current: PipelineConfig },
    gifData?: DecodedGif
  ) {
    this.mediaElement = mediaElement;
    this.isVideo = mediaElement instanceof HTMLVideoElement;
    this.gifData = gifData;
    this.displayCanvas = displayCanvas;
    this.configRef = configRef;

    const ctx = this.displayCanvas.getContext('2d');
    if (!ctx) throw new Error('Não foi possível inicializar o contexto do Canvas Principal.');
    this.displayCtx = ctx;

    this.processCanvas = document.createElement('canvas');
    const pCtx = this.processCanvas.getContext('2d', { willReadFrequently: true });
    if (!pCtx) throw new Error('Não foi possível inicializar o contexto do Canvas de Processamento.');
    this.processCtx = pCtx;
  }

  public start(): void {
    this.isRunning = true;
    if (this.isVideo || (this.gifData && this.gifData.frames.length > 1)) {
      this.lastGifFrameTime = performance.now();
      this.renderLoop();
    } else {
      // Para imagem estática (ou GIF de 1 frame), processa 1 frame imediatamente
      this.processFrame();
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public forceRender(): void {
    this.processFrame();
  }

  private renderLoop = (): void => {
    if (!this.isRunning) return;

    if (this.isVideo) {
      const video = this.mediaElement as HTMLVideoElement;
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !video.paused && !video.ended) {
        this.processFrame();
      }
    } else if (this.gifData && this.gifData.frames.length > 1) {
      const now = performance.now();
      const currentFrame = this.gifData.frames[this.currentGifFrameIndex];
      if (now - this.lastGifFrameTime >= currentFrame.delay) {
        this.currentGifFrameIndex = (this.currentGifFrameIndex + 1) % this.gifData.frames.length;
        this.lastGifFrameTime = now;
      }
      this.processFrame();
    }

    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  };

  private processFrame(): void {
    const config = this.configRef.current;

    // Resolução original da mídia
    let sourceWidth = 0;
    let sourceHeight = 0;

    if (this.gifData) {
      sourceWidth = this.gifData.width;
      sourceHeight = this.gifData.height;
    } else if (this.isVideo) {
      sourceWidth = (this.mediaElement as HTMLVideoElement).videoWidth;
      sourceHeight = (this.mediaElement as HTMLVideoElement).videoHeight;
    } else {
      sourceWidth = (this.mediaElement as HTMLImageElement).naturalWidth;
      sourceHeight = (this.mediaElement as HTMLImageElement).naturalHeight;
    }

    if (!sourceWidth || !sourceHeight) return;

    // 1. Resolução Alvo (Downscaling)
    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;

    if (config.resolution.enabled) {
      targetHeight = config.resolution.targetHeight;
      const aspectRatio = sourceWidth / sourceHeight;
      targetWidth = Math.round(targetHeight * aspectRatio);
    }

    // Redimensiona o canvas interno se a resolução alvo mudou
    if (this.processCanvas.width !== targetWidth || this.processCanvas.height !== targetHeight) {
      this.processCanvas.width = targetWidth;
      this.processCanvas.height = targetHeight;
    }

    // Ajusta dimensões do canvas visível para manter aspect ratio
    if (this.displayCanvas.width !== targetWidth || this.displayCanvas.height !== targetHeight) {
      this.displayCanvas.width = targetWidth;
      this.displayCanvas.height = targetHeight;
    }

    // 2. Desenha a fonte da mídia no Canvas Interno
    if (this.gifData && this.gifData.frames.length > 0) {
      const activeFrameCanvas = this.gifData.frames[this.currentGifFrameIndex].canvas;
      this.processCtx.drawImage(activeFrameCanvas, 0, 0, targetWidth, targetHeight);
    } else {
      this.processCtx.drawImage(this.mediaElement, 0, 0, targetWidth, targetHeight);
    }

    // 3. Extrai ImageData
    const imageData = this.processCtx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;

    // 4. Executa Pipeline Modular de Filtros
    applyAdjustments(data, targetWidth, targetHeight, config.adjustments);
    applyChromaticAberration(data, targetWidth, targetHeight, config.chromaticAberration);

    if (config.dithering.enabled) {
      switch (config.dithering.algorithm) {
        case 'bayer4x4':
        case 'bayer8x8':
          applyBayerDither(data, targetWidth, targetHeight, config.dithering);
          break;
        case 'floydSteinberg':
          applyFloydSteinbergDither(data, targetWidth, targetHeight, config.dithering);
          break;
        case 'atkinson':
          applyAtkinsonDither(data, targetWidth, targetHeight, config.dithering);
          break;
        case 'none':
        default:
          break;
      }
    }

    // 5. Atualiza os pixels do Canvas Interno
    this.processCtx.putImageData(imageData, 0, 0);

    // 6. Redesenha no Canvas Principal com Pixelate (Sem interpolação bilinear)
    this.displayCtx.imageSmoothingEnabled = false;
    this.displayCtx.drawImage(
      this.processCanvas,
      0, 0, targetWidth, targetHeight,
      0, 0, this.displayCanvas.width, this.displayCanvas.height
    );

    // 7. Efeito de Linhas de Varredura (CRT Scanlines)
    if (config.crtEffect) {
      this.drawScanlines(targetWidth, targetHeight);
    }
  }

  private drawScanlines(width: number, height: number): void {
    this.displayCtx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let y = 0; y < height; y += 4) {
      this.displayCtx.fillRect(0, y, width, 1.5);
    }
  }
}
