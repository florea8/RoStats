import { useRef, useEffect } from 'react'
import { aqiColor, aqiHex, aqiTag, magColor } from '../utils/colors'
import { timeAgo } from '../utils/time'
import '../styles/RightPanel.css'

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

/* ── Section SVG icons ── */
const SECTION_ICONS = {
  seismic: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 12 5 12 8 4 11 20 14 9 17 14 20 14 22 14"/>
    </svg>
  ),
  aqi: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
    </svg>
  ),
  weather: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
    </svg>
  ),
  traffic: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="15" rx="3"/>
      <circle cx="12" cy="6"  r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="10" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="14" r="1.2" fill="currentColor" stroke="none"/>
      <line x1="12" y1="17" x2="12" y2="22"/>
      <line x1="8"  y1="22" x2="16" y2="22"/>
    </svg>
  ),
  indicators: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
      <line x1="2"  y1="20" x2="22" y2="20"/>
    </svg>
  ),
}

const TRAFFIC_COLOR = { FREE: '#1de9a0', SLOW: '#fbbf24', HEAVY: '#f87171' }

const CITIES = ['bucuresti', 'cluj', 'timisoara', 'iasi', 'constanta', 'brasov']
const CITY_LABELS = {
  bucuresti: 'BUCUREȘTI',
  cluj:      'CLUJ-NAPOCA',
  timisoara: 'TIMIȘOARA',
  iasi:      'IAȘI',
  constanta: 'CONSTANȚA',
  brasov:    'BRAȘOV',
}

/* ══ SECTION: Seismic ══ */
function SeismicSection({ earthquakes }) {
  const canvasRef = useRef(null)
  const { data: quakes, isLoading, isError } = earthquakes

  useEffect(() => {
    if (!quakes?.length) return
    const days = {}
    const now = Date.now()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000).toDateString()
      days[d] = 0
    }
    quakes.forEach(q => {
      const d = new Date(q.properties.time).toDateString()
      if (days[d] !== undefined) days[d]++
    })
    drawSparkline(canvasRef.current, Object.values(days), '#f87171', 'rgba(248,113,113,0.12)')
  }, [quakes])

  return (
    <>
      <div className="detailHeader">
        <span className="detailIcon">{SECTION_ICONS.seismic}</span>
        <div>
          <div className="detailTitle">Activitate Seismică</div>
          <div className="detailSub">Zona România · ultimele evenimente</div>
        </div>
        <a className="phSrc" href="https://earthquake.usgs.gov" target="_blank" rel="noreferrer">USGS ↗</a>
      </div>

      {isLoading && <div className="loading"><div className="spin" />Se încarcă datele seismice…</div>}
      {isError && <div className="loading" style={{ color: 'var(--red)' }}>Eroare conexiune USGS</div>}

      <div className="eqList">
        {quakes?.slice(0, 10).map((q, i) => {
          const p = q.properties
          const mag = parseFloat(p.mag).toFixed(1)
          const depth = Math.round(q.geometry.coordinates[2])
          const loc = p.place?.split(' of ').pop() ?? '—'
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
            {quakes?.length ? Math.max(...Object.values(
              quakes.reduce((acc, q) => {
                const d = new Date(q.properties.time).toDateString()
                acc[d] = (acc[d] || 0) + 1
                return acc
              }, {})
            )) : 0}/ZI MAX
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
  const { data: aqiData, aqiHistory, isLoading } = aqi

  useEffect(() => {
    if (!aqiHistory?.length) return
    drawSparkline(canvasRef.current, aqiHistory, '#1de9a0', 'rgba(29,233,160,0.11)')
  }, [aqiHistory])

  return (
    <>
      <div className="detailHeader">
        <span className="detailIcon">{SECTION_ICONS.aqi}</span>
        <div>
          <div className="detailTitle">Calitatea Aerului</div>
          <div className="detailSub">Indice AQI · stații active</div>
        </div>
        <a className="phSrc" href="https://openaq.org" target="_blank" rel="noreferrer">OpenAQ ↗</a>
      </div>

      {isLoading && <div className="loading"><div className="spin" />Se încarcă datele AQI…</div>}

      {CITIES.map(id => {
        const v = aqiData?.[id]
        if (!v) return null
        const pct = Math.min(100, (v / 150) * 100).toFixed(0)
        const color = aqiColor(v)
        const hex   = aqiHex(v)
        return (
          <div className="aqiRow" key={id}>
            <div className="aqiDot" style={{ background: hex, boxShadow: `0 0 8px ${hex}66` }} />
            <div className="aqiCity">{CITY_LABELS[id]}</div>
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
            {aqiHistory?.length ? aqiHistory[aqiHistory.length - 1] + ' ACUM' : ''}
          </span>
        </div>
        <div className="sparkWrap">
          <div className="sparkLabel"><span>trend orar</span></div>
          <canvas ref={canvasRef} height={54} style={{ width: '100%', display: 'block' }} />
        </div>
      </div>
    </>
  )
}

/* ══ SECTION: Weather ══ */
function WeatherSection({ weather }) {
  const { data: wxData, isLoading } = weather
  return (
    <>
      <div className="detailHeader">
        <span className="detailIcon">{SECTION_ICONS.weather}</span>
        <div>
          <div className="detailTitle">Vreme</div>
          <div className="detailSub">Prognoză meteo · orașe principale</div>
        </div>
        <a className="phSrc" href="https://openweathermap.org" target="_blank" rel="noreferrer">OWM ↗</a>
      </div>

      {isLoading && <div className="loading"><div className="spin" />Se încarcă prognoza…</div>}

      <div className="wxGrid">
        {CITIES.map(id => {
          const w = wxData?.[id]
          return (
            <div className="wxCard" key={id}>
              <div className="wxCity">{CITY_LABELS[id]}</div>
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
  const { data: trafficData } = traffic
  return (
    <>
      <div className="detailHeader">
        <span className="detailIcon">{SECTION_ICONS.traffic}</span>
        <div>
          <div className="detailTitle">Trafic</div>
          <div className="detailSub">Drumuri principale · estimat</div>
        </div>
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
        const dot = TRAFFIC_COLOR[r.status] ?? 'var(--txt3)'
        return (
          <div className="trRow" key={i}>
            <div className="trDot" style={{ background: dot, boxShadow: `0 0 6px ${dot}88` }} />
            <span className="trName">{r.name}</span>
            <span className={`trBadge tr${statusKey}`}>{r.status}</span>
          </div>
        )
      })}

      <div className="trNote">Datele de trafic sunt estimate în funcție de ora din zi și comportamente tipice de trafic.</div>
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
        <span className="detailIcon">{SECTION_ICONS.indicators}</span>
        <div>
          <div className="detailTitle">Indicatori Naționali</div>
          <div className="detailSub">Date economice · INS Romania</div>
        </div>
        <a className="phSrc" href="https://insse.ro" target="_blank" rel="noreferrer">INS ↗</a>
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
