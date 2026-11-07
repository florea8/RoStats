import { aqiColor, magColor, tempColor } from '../../utils/colors'
import { summarize24h } from '../../utils/earthquakes'
import { CITIES } from '../../data/cities'
import { timeAgo } from '../../utils/time'

function eventCountColor(count) {
  if (count > 10) return 'var(--red)'
  if (count > 5) return 'var(--amber)'
  return 'var(--green)'
}

function Stat({ value, label, color }) {
  return (
    <div className="mdpStat">
      <div className="mdpStatVal" style={{ color }}>{value}</div>
      <div className="mdpStatLabel">{label}</div>
    </div>
  )
}

function SeismicColumn({ quakes, fetchedAt }) {
  const { count, maxMag } = summarize24h(quakes ?? [], fetchedAt)
  const latest = quakes?.[0]

  return (
    <div className="mdpCol">
      <div className="mdpColHead">SEISMIC ACTIVITY · 24H</div>
      <div className="mdpSeismicStats">
        <Stat value={count} label="EVENTS" color={eventCountColor(count)} />
        <Stat
          value={maxMag != null ? `M ${maxMag.toFixed(1)}` : '—'}
          label="MAX MAG"
          color={maxMag != null ? magColor(maxMag) : 'var(--txt4)'}
        />
        <Stat value={quakes?.length ?? '—'} label="TOTAL 30D" color="var(--txt2)" />
      </div>
      {latest && (
        <div className="mdpLatestQuake">
          <span className="mdpLqMag" style={{ color: magColor(latest.magnitude) }}>
            M{latest.magnitude.toFixed(1)}
          </span>
          <span className="mdpLqLoc">{latest.place?.substring(0, 24) ?? '—'}</span>
          <span className="mdpLqTime">{timeAgo(latest.time)}</span>
        </div>
      )}
    </div>
  )
}

function AqiColumn({ aqiData }) {
  return (
    <div className="mdpCol">
      <div className="mdpColHead">AIR QUALITY · AQI</div>
      <div className="mdpAqiList">
        {CITIES.map(c => {
          const v = aqiData?.[c.id]
          if (v == null) return null
          const color = aqiColor(v)
          return (
            <div className="mdpAqiRow" key={c.id}>
              <span className="mdpAqiCity">{c.short}</span>
              <div className="mdpAqiBarWrap">
                <div className="mdpAqiBarFill" style={{ width: `${Math.min(100, (v / 150) * 100)}%`, background: color }} />
              </div>
              <span className="mdpAqiVal" style={{ color }}>{v}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeatherColumn({ wxData }) {
  return (
    <div className="mdpCol">
      <div className="mdpColHead">TEMPERATURES · °C</div>
      <div className="mdpWxList">
        {CITIES.map(c => {
          const w = wxData?.[c.id]
          return (
            <div className="mdpWxRow" key={c.id}>
              <span className="mdpWxCity">{c.label}</span>
              <span className="mdpWxDesc">{w?.description?.substring(0, 11) ?? '—'}</span>
              <span className="mdpWxTemp" style={{ color: w ? tempColor(w.temp) : 'var(--txt4)' }}>
                {w ? `${w.temp}°` : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Summary strip under the map: seismic stats, AQI bars and temperatures. */
export default function MapDataPanel({ quakes, fetchedAt, aqiData, wxData }) {
  return (
    <div className="mapDataPanel">
      <SeismicColumn quakes={quakes} fetchedAt={fetchedAt} />
      <div className="mdpDivider" />
      <AqiColumn aqiData={aqiData} />
      <div className="mdpDivider" />
      <WeatherColumn wxData={wxData} />
    </div>
  )
}
