import React from 'react';

type Props = {
  tabs: string[];
  activeTab: string;
  onSelect: (tab: string) => void;
  currentUser?: any;
  locations?: any[];
  selectedLocationId?: string;
  appLocation?: any;
  unreadCount?: number;
  onLocationChange?: (id: string) => void;
  onSignOut?: () => void;
  onSettingsToggle?: () => void;
};

export default function Sidebar({ tabs, activeTab, onSelect, currentUser, locations = [], selectedLocationId, appLocation, unreadCount = 0, onLocationChange, onSignOut, onSettingsToggle }: Props) {
  return (
    <aside className="sidebar">
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:36,height:36,borderRadius:8,background:'var(--accent)'}} />
        <div className="logo">Carwash</div>
      </div>

      {currentUser && (
        <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid rgba(255,255,255,0.1)'}}>        <div style={{fontSize:11,color:'var(--muted-text)',marginBottom:4}}>Signed in as</div>
          <div style={{fontWeight:700,color:'var(--text)',fontSize:14}}>{currentUser.username}</div>
          <div style={{fontSize:11,color:'var(--muted-text)'}}>{currentUser.role}</div>
          <div style={{fontSize:11,color:'var(--muted-text)',marginTop:4}}>Location: {appLocation?.name || 'All locations'}</div>
        </div>
      )}

      {locations.length > 0 && currentUser?.role === 'Admin' && (
        <div style={{marginTop:12}}>
          <label style={{fontSize:11,color:'var(--muted-text)',display:'block',marginBottom:4}}>Switch location</label>
          <select 
            value={selectedLocationId || ''} 
            onChange={(e) => onLocationChange?.(e.target.value)}
            style={{width:'100%',fontSize:12}}
          >
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <nav style={{display:'flex',flexDirection:'column',gap:6,marginTop:16}}>

        {tabs.map((tab) => (
          <div
            key={tab}
            className={`nav-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onSelect(tab)}
            role="button"
            tabIndex={0}
          >
            <span style={{fontWeight:700}}>{tab}</span>
          </div>
        ))}
      </nav>

      <div style={{flex:1}} />

      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <button className="secondary small" onClick={onSettingsToggle} title="Settings" style={{flex:1}}>⚙️ Settings</button>
        <button className="secondary small" onClick={onSignOut} style={{flex:1}}>Sign out</button>
      </div>

      <div style={{fontSize:11,color:'var(--muted-text)',textAlign:'center'}}>
        v1 • Carwash Staff Management
      </div>
    </aside>
  );
}
