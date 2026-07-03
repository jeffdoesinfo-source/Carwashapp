import React from 'react';

type Props = {
  currentUser: any;
  locationName?: string;
  unreadCount?: number;
  selectedLocationId?: string;
  locations?: any[];
  onLocationChange?: (id: string) => void;
  onSignOut?: () => void;
  onMenuToggle?: () => void;
  onSettingsToggle?: () => void;
  isMobileMenuOpen?: boolean;
};

export default function Topbar({ currentUser, locationName, unreadCount = 0, locations = [], selectedLocationId, onLocationChange, onSignOut, onMenuToggle, onSettingsToggle, isMobileMenuOpen }: Props) {
  return (
    <div className="topbar">
      <div style={{display:'flex',alignItems:'center',gap:12,flex:1,minWidth:0}}>
        <button className="hamburger" onClick={onMenuToggle} style={{display:'none',paddingLeft:0}} aria-label="Toggle menu">
          ☰
        </button>
        <div style={{fontWeight:800,color:'var(--text)',fontSize:'clamp(14px, 2vw, 16px)'}}>Operations Dashboard</div>
        <div style={{color:'var(--muted-text)',display:'none'}}>|</div>
        <div style={{color:'var(--muted-text)',display:'none'}}>Location: {locationName || '—'}</div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{position:'relative'}}>
          <button className="secondary">🔔</button>
          {unreadCount > 0 && <span style={{position:'absolute',right:-6,top:-6,background:'var(--accent)',color:'#fff',borderRadius:999,padding:'2px 6px',fontSize:12}}>{unreadCount}</span>}
        </div>
        <button className="secondary" onClick={onSettingsToggle} title="Settings">⚙️</button>
        <div className="user-chip" style={{display:'none'}}>
          <div style={{width:28,height:28,borderRadius:6,background:'var(--muted-surface)'}} />
          <div style={{display:'flex',flexDirection:'column'}}>
            <span style={{fontWeight:700}}>{currentUser?.username}</span>
            <span style={{fontSize:12,color:'var(--muted-text)'}}>{currentUser?.role}</span>
          </div>
        </div>
        <button className="secondary" onClick={onSignOut}>Sign out</button>
      </div>
    </div>
  );
}
