import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Video, Sparkles } from 'lucide-react';
import { MediaSource } from '../types/pipeline';
import { decodeGif } from '../engine/gifDecoder';

interface FileUploadProps {
  onMediaLoaded: (media: MediaSource) => void;
  currentMedia: MediaSource | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onMediaLoaded, currentMedia }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    const isVid = file.type.startsWith('video/');

    if (isGif) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const decoded = await decodeGif(arrayBuffer);

        if (decoded.frames.length > 1) {
          onMediaLoaded({
            type: 'gif',
            url: fileUrl,
            name: file.name,
            aspectRatio: decoded.width / decoded.height,
            gifData: decoded
          });
          return;
        }
      } catch (err) {
        console.warn('Erro ao decodificar GIF animado. Usando como imagem estática:', err);
      }
    }

    if (isVid) {
      const video = document.createElement('video');
      video.src = fileUrl;
      video.onloadedmetadata = () => {
        onMediaLoaded({
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
        onMediaLoaded({
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="upload-container">
      <div 
        className="dropzone"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*,video/*,.gif"
          onChange={handleFileChange}
        />
        
        <div className="dropzone-content">
          <Upload size={32} className="dropzone-icon text-green" />
          <p className="dropzone-title">
            {currentMedia ? `Substituir Mídia (${currentMedia.name})` : 'Clique ou Arraste GIF Animado, Imagem ou Vídeo'}
          </p>
          <p className="dropzone-hint">
            Suporta GIFs Animados, MP4, WebM, PNG, JPG • Processamento 100% no Navegador
          </p>
        </div>
      </div>

      {currentMedia && (
        <div className="media-info-bar">
          <span className="media-type-badge">
            {currentMedia.type === 'video' ? <Video size={14} /> : currentMedia.type === 'gif' ? <Sparkles size={14} /> : <ImageIcon size={14} />}
            {currentMedia.type.toUpperCase()}
          </span>
          <span className="media-filename">{currentMedia.name}</span>
          {currentMedia.type === 'gif' && currentMedia.gifData && (
            <span className="text-cyan font-mono" style={{ fontSize: '0.8rem' }}>
              ({currentMedia.gifData.frames.length} frames)
            </span>
          )}
        </div>
      )}
    </div>
  );
};
