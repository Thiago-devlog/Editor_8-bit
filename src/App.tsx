import { useState, useRef } from 'react';
import { CanvasPlayer } from './components/CanvasPlayer';
import { ControlsPanel } from './components/ControlsPanel';
import { Taskbar } from './components/Taskbar';
import { MediaSource, PipelineConfig } from './types/pipeline';
import { decodeGif } from './engine/gifDecoder';

const DEFAULT_CONFIG: PipelineConfig = {
  resolution: {
    enabled: true,
    targetHeight: 240
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportPngTriggerRef = useRef<(() => void) | null>(null);

  const processFile = async (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    const isVid = file.type.startsWith('video/');

    if (isGif) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const decoded = await decodeGif(arrayBuffer);

        if (decoded.frames.length > 1) {
          setMedia({
            type: 'gif',
            url: fileUrl,
            name: file.name,
            aspectRatio: decoded.width / decoded.height,
            gifData: decoded
          });
          return;
        }
      } catch (err) {
        console.warn('Erro ao decodificar GIF animado:', err);
      }
    }

    if (isVid) {
      const video = document.createElement('video');
      video.src = fileUrl;
      video.onloadedmetadata = () => {
        setMedia({
          type: 'video',
          url: fileUrl,
          name: file.name,
          aspectRatio: video.videoWidth / video.videoHeight
        });
      };
    } else {
      const img = new Image();
      img.src = fileUrl;
      img.onload = () => {
        setMedia({
          type: 'image',
          url: fileUrl,
          name: file.name,
          aspectRatio: img.naturalWidth / img.naturalHeight
        });
      };
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const handleExportPng = () => {
    if (exportPngTriggerRef.current) {
      exportPngTriggerRef.current();
    }
  };

  return (
    <div className="retro-desktop">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*,video/*,.gif"
        onChange={handleFileChange}
      />

      {/* Ícones da Área de Trabalho */}
      <div className="desktop-icons">
        <div className="desktop-icon active" tabIndex={0} onClick={() => fileInputRef.current?.click()}>
          <div className="icon-graphic">💾</div>
          <span>8-Bit Studio</span>
        </div>
        <div className="desktop-icon" tabIndex={0} onClick={() => fileInputRef.current?.click()}>
          <div className="icon-graphic">📁</div>
          <span>Meus Shaders</span>
        </div>
      </div>

      {/* JANELA PRINCIPAL (ESTILO WIN98 / MEDIA PLAYER) */}
      <div className="window main-app-window">
        {/* Barra de Título */}
        <div className="title-bar">
          <div className="title-bar-text">
            <span>👾</span> 8-Bit Dither Studio - [{media ? media.name : 'untitled.bmp'}]
          </div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" />
          </div>
        </div>

        {/* Barra de Menus Clássica */}
        <div className="menu-bar">
          <span className="menu-item" onClick={() => fileInputRef.current?.click()}><u>F</u>ile</span>
          <span className="menu-item"><u>E</u>dit</span>
          <span className="menu-item"><u>V</u>iew</span>
          <span className="menu-item"><u>I</u>mage</span>
          <span className="menu-item"><u>O</u>ptions</span>
          <span className="menu-item"><u>H</u>elp</span>
        </div>

        {/* Toolbar de Acesso Rápido */}
        <div className="quick-toolbar">
          <button title="Abrir Arquivo" onClick={() => fileInputRef.current?.click()}>📂 Abrir Mídia</button>
          <button title="Salvar Frame" onClick={handleExportPng}>💾 Salvar Frame</button>
          <div className="separator" />
          <span className="toolbar-label">Mídia Carregada:</span>
          <span className="toolbar-info-badge">
            {media ? `${media.type.toUpperCase()}: ${media.name}` : 'Nenhuma Mídia'}
          </span>
        </div>

        {/* Corpo da Janela: Painel de Controles + Viewport */}
        <div className="window-body app-body">
          <ControlsPanel
            config={config}
            onChange={setConfig}
            onReset={handleReset}
            onExportPng={handleExportPng}
          />

          <CanvasPlayer
            media={media}
            config={config}
            onExportPngTrigger={(fn) => { exportPngTriggerRef.current = fn; }}
            onFileDrop={processFile}
          />
        </div>

        {/* BARRA DE STATUS INFERIOR DA JANELA */}
        <footer className="status-bar">
          <p className="status-bar-field status-expand">
            Status: Engine Ready • Pipeline: HTML5 Canvas2D 60FPS
          </p>
          <p className="status-bar-field" style={{ width: '120px' }}>
          <p className="status-bar-field">
            FPS: 60.0
          </p>
          <p className="status-bar-field" style={{ width: '130px' }}>
          <p className="status-bar-field">
            Guest (No Login)
          </p>
          <p className="status-bar-field" style={{ width: '110px', textAlign: 'center' }}>
          <p className="status-bar-field" style={{ textAlign: 'center' }}>
            {config.resolution.enabled ? `${config.resolution.targetHeight}p Pixelated` : 'Native Res'}
          </p>
        </footer>
      </div>

      {/* BARRA DE TAREFAS FIXA NA PARTE INFERIOR DA TELA (TASKBAR WIN98) */}
      <Taskbar
        activeTitle={media ? `8-Bit Dither Studio - ${media.name}` : '8-Bit Dither Studio'}
        onOpenMedia={() => fileInputRef.current?.click()}
      />
    </div>
  );
}

export default App;
