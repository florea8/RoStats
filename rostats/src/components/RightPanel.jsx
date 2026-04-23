import { useRef, useEffect } from 'react'
import { aqiColor, aqiTag } from '../utils/colors'

function drawSparkline(canvas, values, color, fillColor) {
  if (!canvas || !values || values.length < 2) return
  const ctx = canvas.getContext('2d')
  const W = canvas.offsetWidth || 200
  const H = 52
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
  ctx.lineWidth = 1.5
  ctx.stroke()

  const last = pts[pts.length - 1]
  ctx.beginPath()
  ctx.arc(last.x, last.y, 3, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

const CITIES = ['bucuresti', 'cluj', 'timisoara', 'iasi', 'constanta', 'brasov']
const CITY_LABELS = {
  bucuresti: 'BUCHAREST',
  cluj:      'CLUJ-NAPOCA',
  timisoara: 'TIMIȘOARA',
  iasi:      'IAȘI',
  constanta: 'CONSTANȚA',
  brasov:    'BRAȘOV',
}

const TRAFFIC_ROUTES = [
  { n: 'A1  BUC – PITEȘTI',    states: ['FREE', 'FREE', 'SLOW', 'FREE'] },
  { n: 'A2  BUC – CONSTANȚA',  states: ['SLOW', 'SLOW', 'HEAVY', 'SLOW'] },
  { n: 'A3  BUC – CLUJ',       states: ['FREE', 'FREE', 'FREE', 'SLOW'] },
  { n: 'DN1 BUC – BRAȘOV',     states: ['SLOW', 'HEAVY', 'SLOW', 'FREE'] },
  { n: 'DN7 RM.VÂL – SIBIU',   states: ['FREE', 'FREE', 'FREE', 'FREE'] },
]

function AqiSparkline({ history }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!history?.length) return
    drawSparkline(canvasRef.current, history, '#00e0aa', 'rgba(0,224,170,0.07)')
  }, [history])

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="ph-title">AQI Bucharest · 24h</span>
      </div>
      <div className="spark-wrap">
        <div className="spark-label">
          <span>hourly trend</span>
          <span style={{ color: 'var(--a)' }}>
            {history?.length ? history[history.length - 1] + ' AQI NOW' : ''}
          </span>
        </div>
        <canvas ref={canvasRef} height={52} style={{ width: '100%', display: 'block' }} />
      </div>
    </div>
  )
}

export default function RightPanel({ aqi, weather, traffic }) {
  const { data: aqiData, aqiHistory, isLoading: aqiLoading } = aqi
  const { data: wxData, isLoading: wxLoading } = weather
  const { data: trafficData } = traffic

  return (
    <div className="panel-right boot-fade d4">

      {/* AQI list */}
      <div className="panel">
        <div className="panel-head">
          <span className="ph-title">Air Quality · AQI</span>
          <a className="ph-src" href="https://openaq.org" target="_blank" rel="noreferrer">OpenAQ ↗</a>
        </div>
        {aqiLoading && <div className="loading"><div className="spin" />Fetching AQI data…</div>}
        {CITIES.map(id => {
          const v = aqiData?.[id]
          if (!v) return null
          const pct = Math.min(100, (v / 150) * 100).toFixed(0)
          return (
            <div className="aqi-row" key={id}>
              <div className="aqi-city">{CITY_LABELS[id]}</div>
              <div className="aqi-bar-wrap">
                <div className="aqi-bar-fill" style={{ width: `${pct}%`, background: aqiColor(v) }} />
              </div>
              <div className="aqi-num" style={{ color: aqiColor(v) }}>{v}</div>
              <div className="aqi-tag">{aqiTag(v)}</div>
            </div>
          )
        })}
      </div>

      {/* AQI sparkline */}
      <AqiSparkline history={aqiHistory} />

      {/* Weather */}
      <div className="panel">
        <div className="panel-head">
          <span className="ph-title">Weather · Main Cities</span>
          <a className="ph-src" href="https://openweathermap.org" target="_blank" rel="noreferrer">OWM ↗</a>
        </div>
        {wxLoading && <div className="loading"><div className="spin" />Fetching weather…</div>}
        <div className="wx-grid">
          {CITIES.map(id => {
            const w = wxData?.[id]
            return (
              <div className="wx-card" key={id}>
                <div className="wx-city">{CITY_LABELS[id]}</div>
                <div className="wx-temp">{w ? `${w.temp}°` : '—'}</div>
                <div className="wx-desc">{w?.description ?? '—'}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Traffic */}
      <div className="panel">
        <div className="panel-head">
          <span className="ph-title">Traffic · Main Roads</span>
          <span className="ph-src" style={{ cursor: 'default' }}>estimated</span>
        </div>
        {trafficData?.map((r, i) => (
          <div className="tr-row" key={i}>
            <span className="tr-name">{r.name}</span>
            <span className={`tr-badge tr-${r.status.toLowerCase()}`}>{r.status}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
