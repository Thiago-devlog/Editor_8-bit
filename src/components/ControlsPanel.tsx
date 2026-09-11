import React from 'react';
import { PipelineConfig, DitheringAlgorithm, PalettePreset } from '../types/pipeline';

interface ControlsPanelProps {
  config: PipelineConfig;
  onChange: (newConfig: PipelineConfig) => void;
  onReset: () => void;
  onExportPng: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ config, onChange, onReset, onExportPng }) => {
  const updateResolution = (fields: Partial<PipelineConfig['resolution']>) => {
    onChange({
      ...config,
      resolution: { ...config.resolution, ...fields }
    });
  };

  const updateDithering = (fields: Partial<PipelineConfig['dithering']>) => {
    onChange({
      ...config,
      dithering: { ...config.dithering, ...fields }
    });
  };

  const updateChromatic = (fields: Partial<PipelineConfig['chromaticAberration']>) => {
    onChange({
      ...config,
      chromaticAberration: { ...config.chromaticAberration, ...fields }
    });
  };

  const updateAdjustments = (fields: Partial<PipelineConfig['adjustments']>) => {
    onChange({
      ...config,
      adjustments: { ...config.adjustments, ...fields }
    });
  };

  const toggleCrt = () => {
    onChange({
      ...config,
      crtEffect: !config.crtEffect
    });
  };

  return (
    <aside className="controls-sidebar">
      {/* Fieldset 1: Algoritmos e Resolução */}
      <fieldset>
        <legend>Algoritmo de Dithering</legend>
        <div className="field-row">
          <input
            type="checkbox"
            id="check-dither-enable"
            checked={config.dithering.enabled}
            onChange={(e) => updateDithering({ enabled: e.target.checked })}
          />
          <label htmlFor="check-dither-enable">Ativar Dithering</label>
        </div>

        {config.dithering.enabled && (
          <>
            <div className="field-row" style={{ marginTop: '6px' }}>
              <label htmlFor="algo-select" style={{ minWidth: '75px' }}>Algoritmo:</label>
              <select
                id="algo-select"
                value={config.dithering.algorithm}
                onChange={(e) => updateDithering({ algorithm: e.target.value as DitheringAlgorithm })}
                style={{ flex: 1, minWidth: '0' }}
              >
                <option value="bayer4x4">Matriz Bayer 4x4 (Ordenado)</option>
                <option value="bayer8x8">Matriz Bayer 8x8 (Ordenado Fino)</option>
                <option value="floydSteinberg">Floyd-Steinberg (Difusão Error)</option>
                <option value="atkinson">Atkinson (MacPaint Clássico)</option>
                <option value="none">Threshold (Sem Dithering)</option>
              </select>
            </div>

            <div className="field-row" style={{ marginTop: '6px' }}>
              <label htmlFor="palette-select" style={{ minWidth: '75px' }}>Paleta 8-Bit:</label>
              <select
                id="palette-select"
                value={config.dithering.preset}
                onChange={(e) => updateDithering({ preset: e.target.value as PalettePreset })}
                style={{ flex: 1, minWidth: '0' }}
              >
                <option value="fullColor">Cores Livres Quantizadas</option>
                <option value="gameboy">Game Boy Classic (4 Verdes)</option>
                <option value="cga">IBM CGA Retro (Cyan / Pink)</option>
                <option value="cyberpunk">Cyberpunk Neon (5 Cores)</option>
                <option value="vaporwave">Vaporwave Aesthetic (5 Cores)</option>
              </select>
            </div>

            {config.dithering.preset === 'fullColor' && (
              <div className="field-row-stacked" style={{ marginTop: '6px' }}>
                <div className="slider-header">
                  <label htmlFor="levels-slider">Cores por Canal:</label>
                  <span className="value-tag">{config.dithering.colorPaletteSize} Níveis</span>
                </div>
                <input
                  id="levels-slider"
                  type="range"
                  min="2"
                  max="16"
                  value={config.dithering.colorPaletteSize}
                  onChange={(e) => updateDithering({ colorPaletteSize: Number(e.target.value) })}
                />
              </div>
            )}
          </>
        )}

        <div className="field-row" style={{ marginTop: '8px' }}>
          <input
            type="checkbox"
            id="check-res-enable"
            checked={config.resolution.enabled}
            onChange={(e) => updateResolution({ enabled: e.target.checked })}
          />
          <label htmlFor="check-res-enable">Reduzir Resolução (Pixel Art)</label>
        </div>

        {config.resolution.enabled && (
          <div className="field-row-stacked" style={{ marginTop: '6px' }}>
            <div className="slider-header">
              <label htmlFor="res-slider">Altura Alvo:</label>
              <span className="value-tag">{config.resolution.targetHeight}p px</span>
            </div>
            <input
              id="res-slider"
              type="range"
              min="72"
              max="480"
              step="18"
              value={config.resolution.targetHeight}
              onChange={(e) => updateResolution({ targetHeight: Number(e.target.value) })}
            />
          </div>
        )}
      </fieldset>

      {/* Fieldset 2: Processamento de Sinal / Cores */}
      <fieldset>
        <legend>Processamento de Sinal / Cores</legend>
        <div className="field-row">
          <input
            type="checkbox"
            id="check-adj-enable"
            checked={config.adjustments.enabled}
            onChange={(e) => updateAdjustments({ enabled: e.target.checked })}
          />
          <label htmlFor="check-adj-enable">Ativar Brilho & Contraste</label>
        </div>

        {config.adjustments.enabled && (
          <>
            <div className="field-row-stacked" style={{ marginTop: '6px' }}>
              <div className="slider-header">
                <label htmlFor="bright-slider">Brilho (Bias):</label>
                <span className="value-tag">{config.adjustments.brightness > 0 ? `+${config.adjustments.brightness}` : config.adjustments.brightness}%</span>
              </div>
              <input
                id="bright-slider"
                type="range"
                min="-80"
                max="80"
                step="2"
                value={config.adjustments.brightness}
                onChange={(e) => updateAdjustments({ brightness: Number(e.target.value) })}
              />
            </div>

            <div className="field-row-stacked" style={{ marginTop: '6px' }}>
              <div className="slider-header">
                <label htmlFor="contrast-slider">Contraste (Curva):</label>
                <span className="value-tag">{config.adjustments.contrast > 0 ? `+${config.adjustments.contrast}` : config.adjustments.contrast}%</span>
              </div>
              <input
                id="contrast-slider"
                type="range"
                min="-80"
                max="80"
                step="2"
                value={config.adjustments.contrast}
                onChange={(e) => updateAdjustments({ contrast: Number(e.target.value) })}
              />
            </div>
          </>
        )}

        <div className="field-row" style={{ marginTop: '8px' }}>
          <input
            type="checkbox"
            id="check-chroma-enable"
            checked={config.chromaticAberration.enabled}
            onChange={(e) => updateChromatic({ enabled: e.target.checked })}
          />
          <label htmlFor="check-chroma-enable">Aberração Cromática (Glitch)</label>
        </div>

        {config.chromaticAberration.enabled && (
          <div className="field-row-stacked" style={{ marginTop: '6px' }}>
            <div className="slider-header">
              <label htmlFor="chroma-slider">RGB Shift Offset:</label>
              <span className="value-tag">{config.chromaticAberration.offsetX} px</span>
            </div>
            <input
              id="chroma-slider"
              type="range"
              min="0"
              max="12"
              step="1"
              value={config.chromaticAberration.offsetX}
              onChange={(e) => updateChromatic({ offsetX: Number(e.target.value), offsetY: 0 })}
            />
          </div>
        )}
      </fieldset>

      {/* Fieldset 3: Efeitos Analógicos / CRT */}
      <fieldset>
        <legend>Efeitos CRT & Simulação</legend>
        <div className="field-row">
          <input
            type="checkbox"
            id="check-scanlines"
            checked={config.crtEffect}
            onChange={toggleCrt}
          />
          <label htmlFor="check-scanlines">Scanlines interlaçadas CRT (50%)</label>
        </div>
      </fieldset>

      {/* Botões de Ação Win98 */}
      <div className="action-buttons-group">
        <button style={{ flex: 1 }} onClick={onReset}>
          Resetar
        </button>
        <button style={{ flex: 1, fontWeight: 'bold' }} onClick={onExportPng}>
          Exportar Frame
        </button>
      </div>
    </aside>
  );
};
