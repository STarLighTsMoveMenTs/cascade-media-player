import React from 'react';

interface CodeAgentPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export const CodeAgentPanel: React.FC<CodeAgentPanelProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 20, 40, 0.95)',
        border: '2px solid #00ffff',
        borderRadius: '10px',
        padding: '20px',
        minWidth: '400px',
        maxWidth: '600px',
        zIndex: 1000,
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ color: '#00ffff', margin: 0, fontSize: '1.5rem' }}>Code Agent Panel</h2>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid #00ffff',
            color: '#00ffff',
            cursor: 'pointer',
            padding: '5px 10px',
            borderRadius: '5px',
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ color: '#00ccff' }}>
        <p>AI Code Agent Interface</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          This panel provides advanced code analysis and generation capabilities.
        </p>
      </div>
    </div>
  );
};
