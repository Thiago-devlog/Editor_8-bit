import React, { useEffect, useRef, useState } from 'react';
import { MediaSource, PipelineConfig } from '../types/pipeline';
import { VideoPipelineEngine } from '../engine/videoPipelineEngine';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download } from 'lucide-react';

interface CanvasPlayerProps {
  media: MediaSource | null;
  config: PipelineConfig;
}

export const CanvasPlayer: React.FC<CanvasPlayerProps> = ({ media, config }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const engineRef = useRef<VideoPipelineEngine | null>(null);
  const configRef = useRef<PipelineConfig>(config);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Sincroniza a configuração com a Ref mutável
  useEffect(() => {
    configRef.current = config;
    if (engineRef.current) {
      engineRef.current.forceRender();
    }
  }, [config]);

  // Inicializa o Engine quando a mídia muda
  useEffect(() => {
    if (!canvasRef.current || !media) return;

    const targetMedia = media.type === 'video' ? videoRef.current : imageRef.current;
    if (!targetMedia) return;

    // Se a mídia for vídeo, iniciamos a reprodução
    if (media.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }

    const engine = new VideoPipelineEngine(
      targetMedia,
      canvasRef.current,
      configRef
    );

    engineRef.current = engine;
    engine.start();

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, [media]);

  const togglePlay = () => {
    if (!videoRef.current || media?.type !== 'video') return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const exportSnapshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `8bit_export_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  if (!media) {
    return (
      <div className="canvas-placeholder">
        <p className="placeholder-text">Nenhuma mídia carregada. Faça upload acima para começar!</p>
      </div>
    );
  }

  return (
    <div className="canvas-player-wrapper">
      {/* Elemento oculto do qual o engine lê os frames */}
      {media.type === 'video' ? (
        <video
          ref={videoRef}
          src={media.url}
          loop
          muted={isMuted}
          playsInline
          autoPlay
          style={{ display: 'none' }}
        />
      ) : (
        <img
          ref={imageRef}
          src={media.url}
          alt="Original Source"
          style={{ display: 'none' }}
        />
      )}

      {/* Canvas principal onde os pixels 8-bit são desenhados */}
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          className="main-canvas"
          style={{
            imageRendering: 'pixelated'
          }}
        />
      </div>

      {/* Barra de Ferramentas e Controles de Mídia */}
      <div className="player-toolbar">
        {media.type === 'video' && (
          <div className="video-controls">
            <button onClick={togglePlay} className="btn-icon" title={isPlaying ? 'Pausar' : 'Reproduzir'}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={restartVideo} className="btn-icon" title="Reiniciar Vídeo">
              <RotateCcw size={18} />
            </button>
            <button onClick={toggleMute} className="btn-icon" title={isMuted ? 'Ativar Áudio' : 'Mutar'}>
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        )}

        <div className="export-controls">
          <button onClick={exportSnapshot} className="btn-accent">
            <Download size={16} /> EXPORTAR FRAME (PNG)
          </button>
        </div>
      </div>
    </div>
  );
};
