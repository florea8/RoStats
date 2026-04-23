import '../styles/LeftNav.css'

const NAV_ICONS = {
  seismic: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 12 5 12 8 4 11 20 14 9 17 14 20 14 22 14"/>
    </svg>
  ),
  aqi: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
    </svg>
  ),
  weather: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
    </svg>
  ),
  traffic: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="15" rx="3"/>
      <circle cx="12" cy="6"  r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="10" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="14" r="1.2" fill="currentColor" stroke="none"/>
      <line x1="12" y1="17" x2="12" y2="22"/>
      <line x1="8"  y1="22" x2="16" y2="22"/>
    </svg>
  ),
  indicators: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
      <line x1="2"  y1="20" x2="22" y2="20"/>
    </svg>
  ),
}

const NAV_ITEMS = [
  { id: 'seismic',    label: 'Cutremure',        desc: 'Activitate seismică', accent: '#f87171' },
  { id: 'aqi',        label: 'Calitatea Aerului', desc: 'Indice AQI · stații', accent: '#1de9a0' },
  { id: 'weather',    label: 'Vreme',             desc: 'Prognoză meteo',      accent: '#4facfe' },
  { id: 'traffic',    label: 'Trafic',            desc: 'Drumuri principale',  accent: '#fbbf24' },
  { id: 'indicators', label: 'Indicatori',        desc: 'Date naționale',      accent: '#c4b5fd' },
]

export default function LeftNav({ active, onSelect }) {
  return (
    <nav className="leftNav boot-fade d1">
      <div className="navHeader">SECȚIUNI</div>

      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`navItem${active === item.id ? ' active' : ''}`}
          onClick={() => onSelect(item.id)}
          style={active === item.id ? { '--nav-accent': item.accent } : {}}
        >
          <span className="navIcon" style={active === item.id ? { color: item.accent } : {}}>
            {NAV_ICONS[item.id]}
          </span>
          <div className="navText">
            <span className="navLabel">{item.label}</span>
            <span className="navDesc">{item.desc}</span>
          </div>
          {active === item.id && (
            <div className="navActiveDot" style={{ background: item.accent }} />
          )}
        </button>
      ))}

      <div className="navFooter">
        <div className="navStatus">
          <span className="navStatusDot" />
          SISTEM ACTIV
        </div>
        <div className="navVersion">v1.0 · România</div>
      </div>
    </nav>
  )
}
