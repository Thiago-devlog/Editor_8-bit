import React, { useState, useEffect } from 'react';

/**
 * Componente relógio isolado para que o intervalo de 1 segundo
 * NÃO re-renderize a janela do aplicativo nem o Canvas.
 */
const SystemClock: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="system-tray-clock">{timeStr}</span>;
};

interface TaskbarProps {
  activeTitle?: string;
  onOpenMedia?: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ activeTitle = '8-Bit Dither Studio', onOpenMedia }) => {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  return (
    <footer className="win98-taskbar">
      <div className="taskbar-left">
        {/* Botão Iniciar */}
        <button
          className={`start-button ${isStartMenuOpen ? 'active' : ''}`}
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
        >
          <span className="start-icon">🪟</span>
          <strong>Iniciar</strong>
        </button>

        {/* Menu Iniciar Popup */}
        {isStartMenuOpen && (
          <div className="start-menu-popup" onClick={() => setIsStartMenuOpen(false)}>
            <div className="start-menu-sidebar">
              <span>Windows<b>98</b></span>
            </div>
            <div className="start-menu-items">
              <div className="start-menu-item" onClick={onOpenMedia}>
                <span className="item-icon">📂</span> Abrir Mídia...
              </div>
              <div className="start-menu-item" onClick={() => window.location.reload()}>
                <span className="item-icon">🔄</span> Reiniciar Studio
              </div>
              <div className="start-menu-divider" />
              <div className="start-menu-item" onClick={() => alert('8-Bit Dither Studio v1.0\nFront-End Canvas Engine 60 FPS')}>
                <span className="item-icon">💻</span> Sobre o Sistema...
              </div>
            </div>
          </div>
        )}

        <div className="taskbar-divider" />

        {/* Botão da Janela Ativa na Taskbar (Estilo Pressionado) */}
        <button className="taskbar-item active">
          <span className="task-icon">👾</span>
          <span className="task-title">{activeTitle}</span>
        </button>
      </div>

      {/* System Tray (Bandeja do Sistema à direita com relógio isolado) */}
      <div className="system-tray">
        <span className="tray-icon" title="Áudio Ativo">🔊</span>
        <span className="tray-icon" title="GPU Canvas Engine">👾</span>
        <SystemClock />
      </div>
    </footer>
  );
};
