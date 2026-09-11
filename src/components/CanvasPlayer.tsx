import React, { useEffect, useRef, useState } from 'react';
import { MediaSource, PipelineConfig } from '../types/pipeline';
import { VideoPipelineEngine } from '../engine/videoPipelineEngine';

interface CanvasPlayerProps {
  media: MediaSource | null;
  config: PipelineConfig;
  onExportPngTrigger?: (exportFn: () => void) => void;
  onFileDrop?: (file: File) => void;
}

export const CanvasPlayer: React.FC<CanvasPlayerProps> = ({
  media,
  config,
  onExportPngTrigger,
  onFileDrop
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const engineRef = useRef<VideoPipelineEngine | null>(null);
  const configRef = useRef<PipelineConfig>(config);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('00:00');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Sincroniza a configuração com a Ref mutável
  useEffect(() => {
    configRef.current = config;
    if (engineRef.current) {
      engineRef.current.forceRender();
    }
  }, [config]);

  // Expõe a função de exportação de frame PNG para o componente pai
  useEffect(() => {
    if (onExportPngTrigger) {
      onExportPngTrigger(() => exportSnapshot());
    }
  }, [onExportPngTrigger]);

  // Inicializa o Engine quando a mídia muda
  useEffect(() => {
    if (!canvasRef.current || !media) return;

    const targetMedia = media.type === 'video' ? videoRef.current : imageRef.current;
    if (!targetMedia) return;

    if (media.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }

    const engine = new VideoPipelineEngine(
      targetMedia,
      canvasRef.current,
      configRef,
      media.gifData
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

  const restartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const exportSnapshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `8bit_frame_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const startVideoRecording = async () => {
    if (!canvasRef.current || !media) return;

    const canvas = canvasRef.current;

    if (media.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      await videoRef.current.play();
      setIsPlaying(true);
    }

    const stream = canvas.captureStream(60);

    if (media.type === 'video' && videoRef.current) {
      try {
        // @ts-expect-error captureStream pode existir no HTMLVideoElement
        const videoStream = videoRef.current.captureStream ? videoRef.current.captureStream() : videoRef.current.mozCaptureStream ? videoRef.current.mozCaptureStream() : null;
        if (videoStream) {
          const audioTracks = videoStream.getAudioTracks();
          if (audioTracks.length > 0) stream.addTrack(audioTracks[0]);
        }
      } catch {
        // Fallback
      }
    }

    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }

    const chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `8bit_output_${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setIsRecording(false);
      setRecordingProgress(0);
    };

    let startTime = performance.now();
    let duration = 5000;

    if (media.type === 'video' && videoRef.current && videoRef.current.duration) {
      duration = videoRef.current.duration * 1000;
    } else if (media.type === 'gif' && media.gifData) {
      duration = media.gifData.frames.reduce((acc, f) => acc + f.delay, 0);
    }

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setRecordingProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      }
    }, 100);

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);
    setIsRecording(true);
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const sec = Math.floor(videoRef.current.currentTime);
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    setCurrentTimeStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
  };

  // Handlers para Drag & Drop na Tela Preta
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file && onFileDrop) {
      onFileDrop(file);
    }
  };

  const isAnimatable = media ? (media.type === 'video' || (media.type === 'gif' && media.gifData && media.gifData.frames.length > 1)) : false;

  return (
    <section className="viewport-section">
      <div className="sunken-bezel-container">
        {/* Moldura CRT Preta com Drag & Drop */}
        <div
          className={`crt-screen-monitor ${isDragOver ? 'drag-active' : ''}`}
          style={{ minHeight: media ? 'auto' : '320px' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {media?.type === 'video' ? (
            <video
              ref={videoRef}
              src={media.url}
              loop={!isRecording}
              muted
              playsInline
              autoPlay
              onTimeUpdate={handleTimeUpdate}
              style={{ display: 'none' }}
            />
          ) : media ? (
            <img
              ref={imageRef}
              src={media.url}
              alt="Original Source"
              style={{ display: 'none' }}
            />
          ) : null}

          {/* Canvas Nativo 8-Bit */}
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            className="pixel-canvas"
            style={{ display: media ? 'block' : 'none' }}
          />

          {!media && !isDragOver && (
            <div className="empty-viewport-hint">
              <p style={{ color: '#00ff66', fontFamily: 'monospace', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                Nenhuma mídia carregada.<br />
                <span style={{ color: '#66fcf1' }}>[📥 ARRASTE & SOLTE UMA IMAGEM, GIF OU VÍDEO AQUI]</span><br />
                ou clique em [📂 Abrir Mídia]
              </p>
            </div>
          )}

          {/* OSD Verde Retrô */}
          {media && (
            <div className="osd-tag">
              {media.type === 'video' ? (isPlaying ? '▶ PLAY' : '❚❚ PAUSE') : media.type === 'gif' ? '⚡ GIF ANIMATED' : '📷 IMAGE'}
              {' • '}DITHER: {config.dithering.enabled ? config.dithering.algorithm.toUpperCase() : 'OFF'}
              {' • '}PALETTE: {config.dithering.preset.toUpperCase()}
            </div>
          )}

          {/* Overlay de Feedback ao Arrastar Arquivo */}
          {isDragOver && (
            <div className="crt-drag-overlay">
              <div className="drag-overlay-box">
                <span style={{ fontSize: '32px' }}>📥</span>
                <p>SOLTE O ARQUIVO AQUI PARA CARREGAR</p>
              </div>
            </div>
          )}

          {/* Overlay REC */}
          {isRecording && (
            <div className="win98-recording-overlay">
              <span className="rec-dot"></span>
              REC [{recordingProgress}%]
            </div>
          )}
        </div>

        {/* Barra de Transporte Clássica Windows Media Player 6.4 */}
        <div className="playback-transport-bar">
          {media?.type === 'video' && (
            <>
              <button aria-label="Rewind" onClick={restartVideo} title="Reiniciar">⏮</button>
              <button aria-label={isPlaying ? 'Pause' : 'Play'} onClick={togglePlay} title={isPlaying ? 'Pausar' : 'Play'}>
                {isPlaying ? '❚❚' : '▶'}
              </button>
              <button aria-label="Stop" onClick={() => { if (videoRef.current) { videoRef.current.pause(); setIsPlaying(false); } }} title="Parar">⏹</button>
            </>
          )}

          <span className="timestamp-counter">{currentTimeStr}</span>
          <span style={{ fontSize: '11px', fontWeight: 'bold', marginLeft: '6px' }}>{media ? media.name : 'Sem Mídia'}</span>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
            <button onClick={exportSnapshot} title="Salvar Frame como PNG" disabled={!media || isRecording}>
              💾 Frame (PNG)
            </button>

            {isAnimatable && (
              isRecording ? (
                <button onClick={stopVideoRecording} style={{ background: '#ff3333', color: '#fff', fontWeight: 'bold' }}>
                  ⏹ Parar REC
                </button>
              ) : (
                <button onClick={startVideoRecording} style={{ fontWeight: 'bold' }}>
                  🎥 Gravar .WEBM
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
