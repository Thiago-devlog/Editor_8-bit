import React from 'react';
import { Monitor, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-title">
        <Monitor className="header-icon text-cyan" size={28} />
        <h1>8-BIT DITHER STUDIO</h1>
        <span className="badge">60 FPS ENGINE</span>
      </div>
      <p className="header-subtitle">
        <Sparkles size={14} className="inline-icon text-pink" /> Processador de Efeitos Retrô & Pixel Art em Tempo Real (100% Front-End)
      </p>
    </header>
  );
};
