import { PALETTE, aqiColor, aqiTag } from '../../utils/colors'
import { CITIES } from '../../data/cities'
import SectionHeader from './SectionHeader'
import Sparkline from './Sparkline'

export default function AqiSection({ aqi }) {
  const { data: aqiData, aqiHistory, isLoading, isError, source } = aqi

  return (
    <>
      <SectionHeader
        icon="aqi"
        title="Air Quality"
        subtitle="US AQI index · CAMS European model"
        source={isError ? 'error' : source}
        href="https://open-meteo.com/en/docs/air-quality-api"
        linkLabel="Open-Meteo"
      />

      {isLoading && <div className="loading"><div className="spin" />Loading air quality data…</div>}
      {isError && <div className="loading" style={{ color: 'var(--red)' }}>Could not reach the air quality API</div>}

      {CITIES.map(({ id, label }) => {
        const v = aqiData?.[id]
        if (v == null) return null
        const color = aqiColor(v)
        const pct = Math.min(100, (v / 150) * 100).toFixed(0)
        return (
          <div className="aqiRow" key={id}>
            <div className="aqiDot" style={{ background: color, boxShadow: `0 0 8px ${color}66` }} />
            <div className="aqiCity">{label}</div>
            <div className="aqiBarWrap">
              <div className="aqiBarFill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <div className="aqiNum" style={{ color }}>{v}</div>
            <div className="aqiTag" style={{ color }}>{aqiTag(v)}</div>
          </div>
        )
      })}

      <div className="panel">
        <div className="panelHead">
          <span className="phTitle">AQI Bucharest · 24h trend</span>
          <span style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: 9 }}>
            {aqiData?.bucuresti != null ? `${aqiData.bucuresti} NOW` : ''}
          </span>
        </div>
        <div className="sparkWrap">
          <div className="sparkLabel"><span>hourly average · PostgreSQL</span></div>
          {aqiHistory.length >= 2
            ? <Sparkline values={aqiHistory} color={PALETTE.green} />
            : <div className="sparkEmpty">History is still building up — check back in a few hours.</div>}
        </div>
      </div>
    </>
  )
}
