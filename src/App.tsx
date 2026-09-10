import { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { CanvasPlayer } from './components/CanvasPlayer';
import { ControlsPanel } from './components/ControlsPanel';
import { MediaSource, PipelineConfig } from './types/pipeline';

const DEFAULT_CONFIG: PipelineConfig = {
  resolution: {
    enabled: true,
    targetHeight: 240 // 240p clássico de jogos retro
  },
  dithering: {
    enabled: true,
    algorithm: 'bayer4x4',
    colorPaletteSize: 6,
    preset: 'fullColor'
  },
  chromaticAberration: {
    enabled: false,
    offsetX: 3,
    offsetY: 0
  },
  adjustments: {
    enabled: true,
    brightness: 5,
    contrast: 15,
    saturation: 0
  },
  crtEffect: false
};

export function App() {
  const [media, setMedia] = useState<MediaSource | null>(null);
  const [config, setConfig] = useState<PipelineConfig>(DEFAULT_CONFIG);

  return (
    <div className="app-container">
      <Header />

      <FileUpload
        onMediaLoaded={setMedia}
        currentMedia={media}
      />

      <main className="main-grid">
        <section className="player-section">
          <CanvasPlayer media={media} config={config} />
        </section>

        <aside className="controls-section">
          <ControlsPanel config={config} onChange={setConfig} />
        </aside>
      </main>
    </div>
  );
}

export default App;
