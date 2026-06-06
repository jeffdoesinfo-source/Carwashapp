import React from 'react';

type Props = {
  currentUser: any;
  locationName?: string;
  unreadCount?: number;
  selectedLocationId?: string;
  locations?: any[];
  onLocationChange?: (id: string) => void;
  onSignOut?: () => void;
};

export default function Topbar({ currentUser, locationName, unreadCount = 0, locations = [], selectedLocationId, onLocationChange, onSignOut }: Props) {
  return (
    <div className="topbar">
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{fontWeight:800,color:'var(--text)'}}>Operations Dashboard</div>
        <div style={{color:'var(--muted-text)'}}>|</div>
        <div style={{color:'var(--muted-text)'}}>Location: {locationName || '—'}</div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{position:'relative'}}>
          <button className="secondary">🔔</button>
          {unreadCount > 0 && <span style={{position:'absolute',right:-6,top:-6,background:'var(--accent)',color:'#fff',borderRadius:999,padding:'2px 6px',fontSize:12}}>{unreadCount}</span>}
        </div>
        <div className="user-chip">
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
