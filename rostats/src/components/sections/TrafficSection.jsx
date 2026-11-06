import { PALETTE } from '../../utils/colors'
import SectionHeader from './SectionHeader'

const STATES = [
  { key: 'FREE',  label: 'Free flow', color: PALETTE.green, badge: 'trFree' },
  { key: 'SLOW',  label: 'Moderate',  color: PALETTE.amber, badge: 'trSlow' },
  { key: 'HEAVY', label: 'Heavy',     color: PALETTE.red,   badge: 'trHeavy' },
]
const STATE_BY_KEY = Object.fromEntries(STATES.map(s => [s.key, s]))

function Dot({ color }) {
  return <div className="trDot" style={{ background: color, boxShadow: `0 0 6px ${color}88` }} />
}

export default function TrafficSection({ traffic }) {
  const { data: roads, source } = traffic

  return (
    <>
      <SectionHeader icon="traffic" title="Traffic" subtitle="Main roads · estimated" source={source} />

      <div className="trLegend">
        {STATES.map(s => (
          <div className="trLegItem" key={s.key}><Dot color={s.color} />{s.label}</div>
        ))}
      </div>

      {roads?.map(r => {
        const state = STATE_BY_KEY[r.status]
        return (
          <div className="trRow" key={r.name}>
            <Dot color={state?.color ?? PALETTE.muted} />
            <span className="trName">{r.name}</span>
            <span className={`trBadge ${state?.badge ?? ''}`}>{r.status}</span>
          </div>
        )
      })}

      <div className="trNote">
        Simulated data: each road state is estimated from the time of day (rush hour,
        normal traffic, night). It does not come from a live traffic source.
      </div>
    </>
  )
}
