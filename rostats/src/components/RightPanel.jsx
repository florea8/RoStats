import { useRef, useEffect } from 'react'
import { PALETTE, withAlpha, aqiColor, aqiTag, magColor } from '../utils/colors'
import { CITIES } from '../data/cities'
import { timeAgo } from '../utils/time'
import SourceBadge from './SourceBadge'
import SectionIcon from './SectionIcon'
import '../styles/RightPanel.css'

/* ── Header right side: data-source badge + link to the provider ── */
function DetailMeta({ source, href, label }) {
  return (
    <div className="detailMeta">
      <SourceBadge source={source} />
      {href && <a className="phSrc" href={href} target="_blank" rel="noreferrer">{label} ↗</a>}
    </div>
  )
}

/* ── Earthquake count per day for the last 7 days (oldest first) ── */
function dailyCounts(quakes, days = 7) {
  const counts = {}
  const now = Date.now()
  for (let i = days - 1; i >= 0; i--) {
    counts[new Date(now - i * 86400000).toDateString()] = 0
  }
  quakes.forEach(q => {
    const d = new Date(q.properties.time).toDateString()
    if (counts[d] !== undefined) counts[d]++
  })
  return Object.values(counts)
}

/* ── Shared canvas sparkline ── */
function drawSparkline(canvas, values, color, fillColor) {
  if (!canvas || !values || values.length < 2) return
  const ctx = canvas.getContext('2d')
  const W = canvas.offsetWidth || 200
  const H = 54
  canvas.width = W
  canvas.height = H
  const mn = Math.min(...values)
  const mx = Math.max(...values)
  const range = mx - mn || 1
  const pad = 6
  ctx.clearRect(0, 0, W, H)
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * (W - pad * 2) + pad,
    y: H - pad - ((v - mn) / range) * (H - pad * 2),
  }))
  ctx.beginPath()
  ctx.moveTo(pts[0].x, H)
  pts.forEach(p => ctx.lineTo(p.x, p.y))
  ctx.lineTo(pts[pts.length - 1].x, H)
  ctx.closePath()
  ctx.fillStyle = fillColor
  ctx.fill()
  ctx.beginPath()
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
  ctx.strokeStyle = color
  ctx.lineWidth = 1.8
  ctx.stroke()
  const last = pts[pts.length - 1]
  ctx.beginPath()
  ctx.arc(last.x, last.y, 3.5, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

/* ── Weather condition code ── */
function wxCode(desc) {
  if (!desc) return 'VAR'
  const d = desc.toLowerCase()
  if (d.includes('thunder') || d.includes('storm'))         return 'TSTM'
  if (d.includes('snow') || d.includes('sleet'))            return 'SNW'
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower')) return 'RAIN'
  if (d.includes('fog') || d.includes('mist') || d.includes('haze'))       return 'FOG'
  if (d.includes('wind'))                                   return 'WIND'
  if (d.includes('overcast'))                               return 'OVC'
  if (d.includes('cloud'))                                  return 'CLD'
  if (d.includes('partly') || d.includes('few cloud'))      return 'FEW'
  if (d.includes('clear'))                                  return 'CLR'
  return 'VAR'
}

const TRAFFIC_COLOR = { FREE: PALETTE.green, SLOW: PALETTE.amber, HEAVY: PALETTE.red }

/* ══ SECTION: Seismic ══ */
function SeismicSection({ earthquakes }) {
  const canvasRef = useRef(null)
  const { data: quakes, isLoading, isError } = earthquakes
  const counts = quakes ? dailyCounts(quakes) : []

  useEffect(() => {
    if (!quakes) return
    drawSparkline(canvasRef.current, dailyCounts(quakes), PALETTE.red, withAlpha(PALETTE.red, 0.12))
  }, [quakes])

  return (
    <>
      <div className="detailHeader">
        <span className="detailIcon"><SectionIcon id="seismic" /></span>
        <div>
          <div className="detailTitle">Activitate Seismică</div>
          <div className="detailSub">Zona România · ultimele 30 de zile</div>
        </div>
        <DetailMeta source={isError ? 'error' : quakes && 'live'} href="https://www.emsc-csem.org" label="EMSC" />
      </div>

      {isLoading && <div className="loading"><div className="spin" />Se încarcă datele seismice…</div>}
      {isError && <div className="loading" style={{ color: 'var(--red)' }}>Eroare conexiune EMSC</div>}
      {quakes?.length === 0 && <div className="loading">Niciun cutremur înregistrat în ultimele 30 de zile.</div>}

      <div className="eqList">
        {quakes?.slice(0, 10).map((q, i) => {
          const p = q.properties
          const mag = parseFloat(p.mag).toFixed(1)
          const depth = q.depth_km
          const loc = p.place ?? '—'
          return (
            <div className="eqRow" key={i}>
              <div className="eqBar" style={{ background: magColor(p.mag) }} />
              <div className="eqMag" style={{ color: magColor(p.mag) }}>{mag}</div>
              <div className="eqBody">
                <div className="eqPlace">{loc}</div>
                <div className="eqMeta">↓{depth}km · {timeAgo(p.time)}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="panel">
        <div className="panelHead">
          <span className="phTitle">Frecvență seismică · 7 zile</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--red)', letterSpacing: 1 }}>
            {counts.length ? Math.max(...counts) : 0}/ZI MAX
          </span>
        </div>
        <div className="sparkWrap">
          <div className="sparkLabel"><span>frecvență zilnică</span></div>
          <canvas ref={canvasRef} height={54} style={{ width: '100%', display: 'block' }} />
        </div>
      </div>
    </>
  )
}

/* ══ SECTION: AQI ══ */
function AqiSection({ aqi }) {
  const canvasRef = useRef(null)
  const { data: aqiData, aqiHistory, isLoading, isError, source } = aqi
  const hasTrend = aqiHistory.length >= 2

  useEffect(() => {
    if (!hasTrend) return
    drawSparkline(canvasRef.current, aqiHistory, PALETTE.green, withAlpha(PALETTE.green, 0.11))
  }, [aqiHistory, hasTrend])

  return (
    <>
      <div className="detailHeader">
        <span className="detailIcon"><SectionIcon id="aqi" /></span>
        <div>
          <div className="detailTitle">Calitatea Aerului</div>
          <div className="detailSub">Indice US AQI · model european CAMS</div>
        </div>
        <DetailMeta source={isError ? 'error' : source} href="https://open-meteo.com/en/docs/air-quality-api" label="Open-Meteo" />
      </div>

      {isLoading && <div className="loading"><div className="spin" />Se încarcă datele AQI…</div>}
      {isError && <div className="loading" style={{ color: 'var(--red)' }}>Eroare conexiune AQI</div>}

      {CITIES.map(({ id, label }) => {
        const v = aqiData?.[id]
        if (v == null) return null
        const pct = Math.min(100, (v / 150) * 100).toFixed(0)
        const color = aqiColor(v)
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
          <span className="phTitle">AQI București · tendință 24h</span>
          <span style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: 9 }}>
            {aqiData?.bucuresti != null ? aqiData.bucuresti + ' ACUM' : ''}
          </span>
        </div>
        <div className="sparkWrap">
          <div className="sparkLabel"><span>medie orară · PostgreSQL</span></div>
          {hasTrend
            ? <canvas ref={canvasRef} height={54} style={{ width: '100%', display: 'block' }} />
            : <div className="sparkEmpty">Istoricul se acumulează — revino peste câteva ore.</div>}
        </div>
      </div>
    </>
  )
}

/* ══ SECTION: Weather ══ */
function WeatherSection({ weather }) {
  const { data: wxData, isLoading, isError, source } = weather
  return (
    <>
      <div className="detailHeader">
        <span className="detailIcon"><SectionIcon id="weather" /></span>
        <div>
          <div className="detailTitle">Vreme</div>
          <div className="detailSub">Condiții actuale · orașe principale</div>
        </div>
        <DetailMeta source={isError ? 'error' : source} href="https://openweathermap.org" label="OWM" />
      </div>

      {isLoading && <div className="loading"><div className="spin" />Se încarcă prognoza…</div>}
      {isError && <div className="loading" style={{ color: 'var(--red)' }}>Eroare conexiune meteo</div>}

      <div className="wxGrid">
        {CITIES.map(({ id, label }) => {
          const w = wxData?.[id]
          return (
            <div className="wxCard" key={id}>
              <div className="wxCity">{label}</div>
              <div className="wxTempRow">
                <span className="wxCode">{wxCode(w?.description)}</span>
                <span className="wxTemp">{w ? `${w.temp}°` : '—'}</span>
              </div>
              <div className="wxDesc">{w?.description ?? '—'}</div>
              {w && <div className="wxMeta">HUM {w.humidity}% · WIND {w.wind} m/s</div>}
            </div>
          )
        })}
      </div>

      <div className="wxLegend">
        <div className="wxLegendItem"><span className="wxLegTag">HUM</span> Umiditate</div>
        <div className="wxLegendItem"><span className="wxLegTag">WIND</span> Vânt (m/s)</div>
        <div className="wxLegendItem"><span className="wxLegTag">°C</span> Temperatură</div>
      </div>
    </>
  )
}

/* ══ SECTION: Traffic ══ */
function TrafficSection({ traffic }) {
  const { data: trafficData, source } = traffic
  return (
    <>
      <div className="detailHeader">
        <span className="detailIcon"><SectionIcon id="traffic" /></span>
        <div>
          <div className="detailTitle">Trafic</div>
          <div className="detailSub">Drumuri principale · estimat</div>
        </div>
        <DetailMeta source={source} />
      </div>

      <div className="trLegend">
        {[['FREE', 'Fluent'], ['SLOW', 'Moderat'], ['HEAVY', 'Aglomerat']].map(([k, l]) => (
          <div className="trLegItem" key={k}>
            <div className="trDot" style={{ background: TRAFFIC_COLOR[k], boxShadow: `0 0 6px ${TRAFFIC_COLOR[k]}88` }} />
            {l}
          </div>
        ))}
      </div>

      {trafficData?.map((r, i) => {
        const statusKey = r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase()
        const dot = TRAFFIC_COLOR[r.status] ?? PALETTE.muted
        return (
          <div className="trRow" key={i}>
            <div className="trDot" style={{ background: dot, boxShadow: `0 0 6px ${dot}88` }} />
            <span className="trName">{r.name}</span>
            <span className={`trBadge tr${statusKey}`}>{r.status}</span>
          </div>
        )
      })}

      <div className="trNote">
        Date simulate: starea fiecărui drum este estimată după ora din zi (ore de vârf,
        trafic normal, noapte). Nu provin dintr-o sursă de trafic live.
      </div>
    </>
  )
}

/* ══ SECTION: National Indicators ══ */
function IndicatorsSection() {
  const stats = [
    { label: 'Șomaj', value: '5.4', unit: '%', trend: '▲ 0.2 vs T3', trendDir: 'up-bad' },
    { label: 'Inflație', value: '5.1', unit: '%', trend: '▼ 1.3 vs T3', trendDir: 'down-good' },
    { label: 'Salariu Net', value: '5.18', unit: 'k', trend: '▲ 8.2% y/y', trendDir: 'up-good' },
    { label: 'PIB/capita', value: '14.8', unit: 'k€', trend: '▲ 3.1% vs 2022', trendDir: 'up-good' },
    { label: 'Prod. Industrială', value: '+2.1', unit: '%', trend: '▲ 0.4 vs T3', trendDir: 'up-good' },
    { label: 'Deficit Bugetar', value: '6.2', unit: '%', trend: '▲ 0.8 vs T3', trendDir: 'up-bad' },
  ]

  return (
    <>
      <div className="detailHeader">
        <span className="detailIcon"><SectionIcon id="indicators" /></span>
        <div>
          <div className="detailTitle">Indicatori Naționali</div>
          <div className="detailSub">Date economice · INS România</div>
        </div>
        <DetailMeta source="static" href="https://insse.ro" label="INS" />
      </div>

      <div className="msGrid">
        {stats.map(s => {
          const isGood = s.trendDir === 'up-good' || s.trendDir === 'down-good'
          const trendColor = isGood ? 'var(--green)' : 'var(--red)'
          const valColor = s.trendDir === 'up-bad' || s.trendDir === 'down-bad' ? 'var(--amber)' : 'var(--teal)'
          return (
            <div className="msCell" key={s.label}>
              <div className="msLabel">{s.label}</div>
              <div className="msVal" style={{ color: valColor }}>
                {s.value}<span style={{ fontSize: 13 }}>{s.unit}</span>
              </div>
              <div className="msTrend" style={{ color: trendColor }}>{s.trend}</div>
            </div>
          )
        })}
      </div>

      <div className="trNote">
        Valori preluate manual din publicațiile INS; nu se actualizează automat.
      </div>
    </>
  )
}

/* ══ MAIN EXPORT ══ */
export default function RightPanel({ activeSection, earthquakes, aqi, weather, traffic }) {
  const renderSection = () => {
    switch (activeSection) {
      case 'seismic':    return <SeismicSection earthquakes={earthquakes} />
      case 'aqi':        return <AqiSection aqi={aqi} />
      case 'weather':    return <WeatherSection weather={weather} />
      case 'traffic':    return <TrafficSection traffic={traffic} />
      case 'indicators': return <IndicatorsSection />
      default:           return <SeismicSection earthquakes={earthquakes} />
    }
  }

  return (
    <aside className="detailPanel boot-fade d4" key={activeSection}>
      {renderSection()}
    </aside>
  )
}
