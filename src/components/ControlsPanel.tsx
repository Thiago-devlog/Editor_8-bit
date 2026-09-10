import React from 'react';
import { PipelineConfig, DitheringAlgorithm, PalettePreset } from '../types/pipeline';
import { Grid, Sun, Tv, Palette, Zap } from 'lucide-react';

interface ControlsPanelProps {
  config: PipelineConfig;
  onChange: (newConfig: PipelineConfig) => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ config, onChange }) => {
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
    <div className="controls-panel">
      {/* 1. Controle de Resolução / Pixelização */}
      <div className="control-card">
        <div className="card-header">
          <Grid size={18} className="text-cyan" />
          <h3>Resolução Interna (Pixelização)</h3>
          <label className="switch">
            <input
              type="checkbox"
              checked={config.resolution.enabled}
              onChange={(e) => updateResolution({ enabled: e.target.checked })}
            />
            <span className="slider-toggle"></span>
          </label>
        </div>

        {config.resolution.enabled && (
          <div className="card-body">
            <div className="slider-row">
              <label>
                Altura Alvo: <strong>{config.resolution.targetHeight}p</strong>
              </label>
              <input
                type="range"
                min={72}
                max={480}
                step={18}
                value={config.resolution.targetHeight}
                onChange={(e) => updateResolution({ targetHeight: Number(e.target.value) })}
              />
            </div>
            <p className="field-hint">
              Processar em {config.resolution.targetHeight}p reduz drasticamente o uso de CPU e gera a estética de pixel art nítida.
            </p>
          </div>
        )}
      </div>

      {/* 2. Algoritmo de Dithering */}
      <div className="control-card">
        <div className="card-header">
          <Palette size={18} className="text-pink" />
          <h3>Algoritmo de Dithering</h3>
          <label className="switch">
            <input
              type="checkbox"
              checked={config.dithering.enabled}
              onChange={(e) => updateDithering({ enabled: e.target.checked })}
            />
            <span className="slider-toggle"></span>
          </label>
        </div>

        {config.dithering.enabled && (
          <div className="card-body">
            <div className="form-group">
              <label>Algoritmo:</label>
              <select
                value={config.dithering.algorithm}
                onChange={(e) => updateDithering({ algorithm: e.target.value as DitheringAlgorithm })}
              >
                <option value="bayer4x4">Matriz Bayer 4x4 (Ordenado)</option>
                <option value="bayer8x8">Matriz Bayer 8x8 (Ordenado Fino)</option>
                <option value="floydSteinberg">Floyd-Steinberg (Difusão de Erro)</option>
                <option value="atkinson">Atkinson (Macintosh Clássico)</option>
                <option value="none">Sem Dithering (Quantização Pura)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Preset de Paleta Retro:</label>
              <select
                value={config.dithering.preset}
                onChange={(e) => updateDithering({ preset: e.target.value as PalettePreset })}
              >
                <option value="fullColor">Cores Livres (Quantizadas)</option>
                <option value="gameboy">Nintendo Game Boy (4 Verdes)</option>
                <option value="cga">IBM CGA Retro (Cyan / Magenta)</option>
                <option value="cyberpunk">Cyberpunk Neon (5 Cores)</option>
                <option value="vaporwave">Vaporwave Aesthetic (5 Cores)</option>
              </select>
            </div>

            {config.dithering.preset === 'fullColor' && (
              <div className="slider-row">
                <label>
                  Níveis por Canal: <strong>{config.dithering.colorPaletteSize}</strong>
                </label>
                <input
                  type="range"
                  min={2}
                  max={16}
                  step={1}
                  value={config.dithering.colorPaletteSize}
                  onChange={(e) => updateDithering({ colorPaletteSize: Number(e.target.value) })}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Efeitos de Aberração Cromática & Glitch */}
      <div className="control-card">
        <div className="card-header">
          <Zap size={18} className="text-yellow" />
          <h3>Aberração Cromática (Glitch)</h3>
          <label className="switch">
            <input
              type="checkbox"
              checked={config.chromaticAberration.enabled}
              onChange={(e) => updateChromatic({ enabled: e.target.checked })}
            />
            <span className="slider-toggle"></span>
          </label>
        </div>

        {config.chromaticAberration.enabled && (
          <div className="card-body">
            <div className="slider-row">
              <label>Deslocamento X: {config.chromaticAberration.offsetX}px</label>
              <input
                type="range"
                min={-15}
                max={15}
                step={1}
                value={config.chromaticAberration.offsetX}
                onChange={(e) => updateChromatic({ offsetX: Number(e.target.value) })}
              />
            </div>
            <div className="slider-row">
              <label>Deslocamento Y: {config.chromaticAberration.offsetY}px</label>
              <input
                type="range"
                min={-15}
                max={15}
                step={1}
                value={config.chromaticAberration.offsetY}
                onChange={(e) => updateChromatic({ offsetY: Number(e.target.value) })}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Ajustes Básicos (Brilho & Contraste) */}
      <div className="control-card">
        <div className="card-header">
          <Sun size={18} className="text-green" />
          <h3>Brilho & Contraste</h3>
          <label className="switch">
            <input
              type="checkbox"
              checked={config.adjustments.enabled}
              onChange={(e) => updateAdjustments({ enabled: e.target.checked })}
            />
            <span className="slider-toggle"></span>
          </label>
        </div>

        {config.adjustments.enabled && (
          <div className="card-body">
            <div className="slider-row">
              <label>Brilho: {config.adjustments.brightness}</label>
              <input
                type="range"
                min={-80}
                max={80}
                step={2}
                value={config.adjustments.brightness}
                onChange={(e) => updateAdjustments({ brightness: Number(e.target.value) })}
              />
            </div>
            <div className="slider-row">
              <label>Contraste: {config.adjustments.contrast}</label>
              <input
                type="range"
                min={-80}
                max={80}
                step={2}
                value={config.adjustments.contrast}
                onChange={(e) => updateAdjustments({ contrast: Number(e.target.value) })}
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Linhas de Varredura CRT */}
      <div className="control-card">
        <div className="card-header">
          <Tv size={18} className="text-purple" />
          <h3>Efeito Monitor CRT (Scanlines)</h3>
          <label className="switch">
            <input
              type="checkbox"
              checked={config.crtEffect}
              onChange={toggleCrt}
            />
            <span className="slider-toggle"></span>
          </label>
        </div>
      </div>
    </div>
  );
};
