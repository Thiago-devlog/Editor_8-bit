import { AsciiConfig, AsciiRamp } from '../types/pipeline';

export const ASCII_RAMPS: Record<AsciiRamp, string> = {
  standard: ' .:-=+*#%@',
  matrix: 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01',
  binary: '01',
  katakana: 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ',
  custom: ''
};

export class AsciiEngine {
  private sampleCanvas: HTMLCanvasElement;
  private sampleCtx: CanvasRenderingContext2D;

  constructor() {
    this.sampleCanvas = document.createElement('canvas');
    const ctx = this.sampleCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('AsciiEngine: falha ao criar canvas de amostragem.');
    this.sampleCtx = ctx;
  }

  public render(
    source: HTMLCanvasElement,
    targetCtx: CanvasRenderingContext2D,
    targetW: number,
    targetH: number,
    config: AsciiConfig
  ): void {
    const fontSize = Math.max(4, Math.min(config.fontSize, 32));
    const cellW = fontSize * 0.55;
    const cellH = fontSize;

    const cols = Math.max(1, Math.floor(targetW / cellW));
    const rows = Math.max(1, Math.floor(targetH / cellH));

    if (this.sampleCanvas.width !== cols || this.sampleCanvas.height !== rows) {
      this.sampleCanvas.width = cols;
      this.sampleCanvas.height = rows;
    }

    this.sampleCtx.drawImage(source, 0, 0, cols, rows);
    const { data } = this.sampleCtx.getImageData(0, 0, cols, rows);

    const rampStr = config.ramp === 'custom'
      ? (config.customRamp.length > 0 ? config.customRamp : ASCII_RAMPS.standard)
      : ASCII_RAMPS[config.ramp];
    const rampLen = rampStr.length;
    if (rampLen === 0) return;

    targetCtx.fillStyle = '#000000';
    targetCtx.fillRect(0, 0, targetW, targetH);

    targetCtx.font = `${fontSize}px "Courier New", Courier, monospace`;
    targetCtx.textBaseline = 'top';

    const useSourceColor = config.color === 'source';

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = (row * cols + col) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Luminância Rec. 601: L = 0.299R + 0.587G + 0.114B
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const charIdx = Math.min(rampLen - 1, Math.floor((lum / 255) * rampLen));

        targetCtx.fillStyle = useSourceColor
          ? `rgb(${r},${g},${b})`
          : config.color;

        targetCtx.fillText(rampStr[charIdx], col * cellW, row * cellH);
      }
    }
  }

  public dispose(): void {
    // Sem recursos adicionais a serem liberados
  }
}
