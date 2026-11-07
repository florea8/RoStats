import SectionIcon from './SectionIcon'
import { PALETTE } from '../utils/colors'
import { APP_VERSION } from '../data/app'
import '../styles/LeftNav.css'

const NAV_ITEMS = [
  { id: 'seismic',    label: 'Earthquakes', desc: 'Seismic activity',     accent: PALETTE.red },
  { id: 'aqi',        label: 'Air Quality', desc: 'AQI index · 6 cities', accent: PALETTE.green },
  { id: 'weather',    label: 'Weather',     desc: 'Current conditions',   accent: PALETTE.blue },
  { id: 'traffic',    label: 'Traffic',     desc: 'Main roads',           accent: PALETTE.amber },
  { id: 'indicators', label: 'Indicators',  desc: 'National data',        accent: PALETTE.violet },
]

const OVERALL_LABEL = {
  live:    'ALL SOURCES LIVE',
  demo:    'DEMO DATA IN USE',
  error:   'SOURCE OFFLINE',
  loading: 'CONNECTING…',
}

// Worst state wins: one offline source outweighs the rest being live.
function overallStatus(status) {
  const values = Object.values(status)
  for (const s of ['error', 'loading', 'demo']) {
    if (values.includes(s)) return s
  }
  return 'live'
}

/** status: { seismic, aqi, weather } each one of 'live' | 'demo' | 'error' | 'loading' */
export default function LeftNav({ active, onSelect, status }) {
  const overall = overallStatus(status)
  return (
    <nav className="leftNav boot-fade d2">
      <div className="navHeader">SECTIONS</div>

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
        <div className={`navStatus navStatus--${overall}`}>
          <span className="navStatusDot" />
          {OVERALL_LABEL[overall]}
        </div>
        <div className="navVersion">{APP_VERSION} · Romania</div>
      </div>
    </nav>
  )
}
