import React from 'react';

type Props = {
  updateAvailable: boolean;
  onUpdateNow: () => void;
  onLater: () => void;
};

export default function UpdateBanner({ updateAvailable, onUpdateNow, onLater }: Props) {
  if (!updateAvailable) return null;

  return (
    <div style={bannerStyle} role="status" aria-live="polite">
      <div style={{ flex: 1 }}>A new update is available.</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={buttonStyle} onClick={onLater} aria-label="Later">
          Later
        </button>
        <button style={{ ...buttonStyle, background: '#1976d2', color: '#fff' }} onClick={onUpdateNow} aria-label="Update now">
          Update now
        </button>
      </div>
    </div>
  );
}

const bannerStyle: React.CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  gap: 12,
  background: 'rgba(255,255,255,0.96)',
  borderTop: '1px solid rgba(0,0,0,0.08)',
  boxShadow: '0 -2px 6px rgba(0,0,0,0.06)',
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 6,
  background: 'transparent',
  cursor: 'pointer',
};
