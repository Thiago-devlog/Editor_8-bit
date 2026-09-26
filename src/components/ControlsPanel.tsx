import React from 'react';
import { PipelineConfig, DitheringAlgorithm, PalettePreset, AsciiRamp } from '../types/pipeline';

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

  const updateAscii = (fields: Partial<PipelineConfig['ascii']>) => {
    onChange({
      ...config,
      ascii: { ...config.ascii, ...fields }
    });
  };

  const updateShader = (fields: Partial<PipelineConfig['shader']>) => {
    onChange({
      ...config,
      shader: { ...config.shader, ...fields }
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

      {/* Fieldset 3: ASCII / Matrix & WebGL */}
      <fieldset>
        <legend>ASCII / Matrix & WebGL</legend>

        <div className="field-row">
          <input
            type="checkbox"
            id="check-ascii-enable"
            checked={config.ascii.enabled}
            onChange={(e) => updateAscii({ enabled: e.target.checked })}
          />
          <label htmlFor="check-ascii-enable">Render em ASCII / Matrix</label>
        </div>

        {config.ascii.enabled && (
          <>
            <div className="field-row" style={{ marginTop: '6px' }}>
              <label htmlFor="ascii-ramp" style={{ minWidth: '75px' }}>Ramp:</label>
              <select
                id="ascii-ramp"
                value={config.ascii.ramp}
                onChange={(e) => updateAscii({ ramp: e.target.value as AsciiRamp })}
                style={{ flex: 1, minWidth: '0' }}
              >
                <option value="standard">ASCII Clássico</option>
                <option value="matrix">Matrix / 01</option>
                <option value="binary">Binário</option>
                <option value="katakana">Katakana</option>
                <option value="custom">Customizado</option>
              </select>
            </div>

            {config.ascii.ramp === 'custom' && (
              <div className="field-row-stacked" style={{ marginTop: '6px' }}>
                <label htmlFor="ascii-custom">Ramp customizada:</label>
                <input
                  id="ascii-custom"
                  type="text"
                  value={config.ascii.customRamp}
                  onChange={(e) => updateAscii({ customRamp: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            <div className="field-row-stacked" style={{ marginTop: '6px' }}>
              <div className="slider-header">
                <label htmlFor="ascii-font-size">Tamanho da fonte:</label>
                <span className="value-tag">{config.ascii.fontSize}px</span>
              </div>
              <input
                id="ascii-font-size"
                type="range"
                min="6"
                max="24"
                step="1"
                value={config.ascii.fontSize}
                onChange={(e) => updateAscii({ fontSize: Number(e.target.value) })}
              />
            </div>
          </>
        )}

        <div className="field-row" style={{ marginTop: '8px' }}>
          <input
            type="checkbox"
            id="check-shader-enable"
            checked={config.shader.enabled}
            onChange={(e) => updateShader({ enabled: e.target.checked })}
          />
          <label htmlFor="check-shader-enable">Ativar pós-processamento WebGL</label>
        </div>

        {config.shader.enabled && (
          <>
            <div className="field-row-stacked" style={{ marginTop: '6px' }}>
              <div className="slider-header">
                <label htmlFor="shader-curvature">Curvatura CRT:</label>
                <span className="value-tag">{config.shader.curvature.toFixed(2)}</span>
              </div>
              <input
                id="shader-curvature"
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={config.shader.curvature}
                onChange={(e) => updateShader({ curvature: Number(e.target.value) })}
              />
            </div>

            <div className="field-row-stacked" style={{ marginTop: '6px' }}>
              <div className="slider-header">
                <label htmlFor="shader-chroma">Aberração cromática:</label>
                <span className="value-tag">{config.shader.chromaticAberration.toFixed(2)}</span>
              </div>
              <input
                id="shader-chroma"
                type="range"
                min="0"
                max="0.8"
                step="0.02"
                value={config.shader.chromaticAberration}
                onChange={(e) => updateShader({ chromaticAberration: Number(e.target.value) })}
              />
            </div>

            <div className="field-row-stacked" style={{ marginTop: '6px' }}>
              <div className="slider-header">
                <label htmlFor="shader-scanlines">Scanlines:</label>
                <span className="value-tag">{config.shader.scanlines.toFixed(2)}</span>
              </div>
              <input
                id="shader-scanlines"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.shader.scanlines}
                onChange={(e) => updateShader({ scanlines: Number(e.target.value) })}
              />
            </div>
          </>
        )}
      </fieldset>

      {/* Fieldset 4: Efeitos Analógicos / CRT */}
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
