import SectionIcon from './SectionIcon'
import '../styles/LeftNav.css'

const NAV_ITEMS = [
  { id: 'seismic',    label: 'Cutremure',        desc: 'Activitate seismică', accent: '#f87171' },
  { id: 'aqi',        label: 'Calitatea Aerului', desc: 'Indice AQI · stații', accent: '#1de9a0' },
  { id: 'weather',    label: 'Vreme',             desc: 'Prognoză meteo',      accent: '#4facfe' },
  { id: 'traffic',    label: 'Trafic',            desc: 'Drumuri principale',  accent: '#fbbf24' },
  { id: 'indicators', label: 'Indicatori',        desc: 'Date naționale',      accent: '#c4b5fd' },
]

export default function LeftNav({ active, onSelect }) {
  return (
    <nav className="leftNav boot-fade d2">
      <div className="navHeader">SECȚIUNI</div>

      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`navItem${active === item.id ? ' active' : ''}`}
          onClick={() => onSelect(item.id)}
          style={active === item.id ? { '--nav-accent': item.accent } : {}}
        >
          <span className="navIcon" style={active === item.id ? { color: item.accent } : {}}>
            <SectionIcon id={item.id} size={16} strokeWidth={2} />
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
