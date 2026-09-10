import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Video } from 'lucide-react';
import { MediaSource } from '../types/pipeline';

interface FileUploadProps {
  onMediaLoaded: (media: MediaSource) => void;
  currentMedia: MediaSource | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onMediaLoaded, currentMedia }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const isVid = file.type.startsWith('video/');

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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const isVid = file.type.startsWith('video/');

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
          accept="image/*,video/*"
          onChange={handleFileChange}
        />
        
        <div className="dropzone-content">
          <Upload size={32} className="dropzone-icon text-green" />
          <p className="dropzone-title">
            {currentMedia ? `Substituir Mídia (${currentMedia.name})` : 'Clique ou Arraste Imagem/Vídeo Curto'}
          </p>
          <p className="dropzone-hint">
            Suporta MP4, WebM, PNG, JPG até Full HD • Processamento 100% no seu Navegador
          </p>
        </div>
      </div>

      {currentMedia && (
        <div className="media-info-bar">
          <span className="media-type-badge">
            {currentMedia.type === 'video' ? <Video size={14} /> : <ImageIcon size={14} />}
            {currentMedia.type.toUpperCase()}
          </span>
          <span className="media-filename">{currentMedia.name}</span>
        </div>
      )}
    </div>
  );
};
