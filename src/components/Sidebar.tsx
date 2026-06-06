import React from 'react';

type Props = {
  tabs: string[];
  activeTab: string;
  onSelect: (tab: string) => void;
};

export default function Sidebar({ tabs, activeTab, onSelect }: Props) {
  return (
    <aside className="sidebar">
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:36,height:36,borderRadius:8,background:'var(--accent)'}} />
        <div className="logo">Carwash</div>
      </div>

      <nav style={{display:'flex',flexDirection:'column',gap:6,marginTop:12}}>
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

      <div style={{fontSize:12,color:'var(--muted-text)'}}>
        <div style={{marginBottom:8}}>Theme: Dark • v1</div>
      </div>
    </aside>
  );
}
