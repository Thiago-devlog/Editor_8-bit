import React, { useEffect, useRef, useState } from 'react';
import { MediaSource, PipelineConfig } from '../types/pipeline';
import { VideoPipelineEngine } from '../engine/videoPipelineEngine';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Video, Square } from 'lucide-react';

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);

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

  // Exportar Frame Estático em PNG
  const exportSnapshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `8bit_frame_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Exportar Vídeo Completo ou GIF animado gravado (.webm)
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
        // @ts-expect-error captureStream pode existir no HTMLVideoElement em navegadores compatíveis
        const videoStream = videoRef.current.captureStream ? videoRef.current.captureStream() : videoRef.current.mozCaptureStream ? videoRef.current.mozCaptureStream() : null;
        if (videoStream) {
          const audioTracks = videoStream.getAudioTracks();
          if (audioTracks.length > 0) {
            stream.addTrack(audioTracks[0]);
          }
        }
      } catch {
        // Fallback sem áudio
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
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
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
    let duration = 5000; // Padrão 5s se for GIF animado

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
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
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

  if (!media) {
    return (
      <div className="canvas-placeholder">
        <p className="placeholder-text">Nenhuma mídia carregada. Faça upload acima para começar!</p>
      </div>
    );
  }

  const isAnimatable = media.type === 'video' || (media.type === 'gif' && media.gifData && media.gifData.frames.length > 1);

  return (
    <div className="canvas-player-wrapper">
      {media.type === 'video' ? (
        <video
          ref={videoRef}
          src={media.url}
          loop={!isRecording}
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

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          className="main-canvas"
          style={{
            imageRendering: 'pixelated'
          }}
        />

        {isRecording && (
          <div className="recording-overlay">
            <div className="recording-badge">
              <span className="rec-dot pulsing"></span>
              GRAVANDO ANIMAÇÃO... [{recordingProgress}%]
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${recordingProgress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="player-toolbar">
        {media.type === 'video' && (
          <div className="video-controls">
            <button onClick={togglePlay} className="btn-icon" title={isPlaying ? 'Pausar' : 'Reproduzir'} disabled={isRecording}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={restartVideo} className="btn-icon" title="Reiniciar Vídeo" disabled={isRecording}>
              <RotateCcw size={18} />
            </button>
            <button onClick={toggleMute} className="btn-icon" title={isMuted ? 'Ativar Áudio' : 'Mutar'} disabled={isRecording}>
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        )}

        <div className="export-controls">
          <button onClick={exportSnapshot} className="btn-secondary" disabled={isRecording}>
            <Download size={15} /> FRAME (PNG)
          </button>

          {isAnimatable && (
            isRecording ? (
              <button onClick={stopVideoRecording} className="btn-danger">
                <Square size={15} /> PARAR GRAVAÇÃO
              </button>
            ) : (
              <button onClick={startVideoRecording} className="btn-accent">
                <Video size={15} /> GRAVAR ANIMAÇÃO (.WEBM)
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
