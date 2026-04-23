import { useRef, useEffect } from 'react'
import { magColor } from '../utils/colors'
import { timeAgo } from '../utils/time'
import '../styles/LeftPanel.css'

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

function EqSparkline({ quakes }) {
  const canvasRef = useRef(null)

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
    const vals = Object.values(days)
    drawSparkline(canvasRef.current, vals, '#f59e0b', 'rgba(245,158,11,0.12)')
  }, [quakes])

  return (
    <div className="panel boot-fade d2">
      <div className="panelHead">
        <span className="phTitle">📈 Activitate Seismică · 7 zile</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--warn)', letterSpacing: 1 }}>
          MAX {quakes?.length ? Math.max(...Object.values(
            quakes.reduce((acc, q) => {
              const d = new Date(q.properties.time).toDateString()
              acc[d] = (acc[d] || 0) + 1
              return acc
            }, {})
          )) : 0}/DAY
        </span>
      </div>
      <div className="sparkWrap">
        <div className="sparkLabel">
          <span>daily frequency</span>
        </div>
        <canvas ref={canvasRef} height={52} style={{ width: '100%', display: 'block' }} />
      </div>
    </div>
  )
}

export default function LeftPanel({ earthquakes }) {
  const { data: quakes, isLoading, isError } = earthquakes

  return (
    <div className="panelLeft boot-fade d2">
      {/* Earthquake list */}
      <div className="panel">
        <div className="panelHead">
          <span className="phTitle">🌍 Cutremure · Zona RO</span>
          <a className="phSrc" href="https://earthquake.usgs.gov" target="_blank" rel="noreferrer">USGS ↗</a>
        </div>
      </div>

      <div className="panelScroll">
        {isLoading && (
          <div className="loading"><div className="spin" />Fetching seismic data…</div>
        )}
        {isError && (
          <div className="loading" style={{ color: 'var(--red)' }}>USGS connection error</div>
        )}
        {quakes?.slice(0, 8).map((q, i) => {
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

      <EqSparkline quakes={quakes} />

      {/* National stats */}
      <div className="panel">
        <div className="panelHead">
          <span className="phTitle">📊 Indicatori Naționali</span>
          <a className="phSrc" href="https://insse.ro" target="_blank" rel="noreferrer">INS ↗</a>
        </div>
        <div className="msGrid">
          <div className="msCell">
            <div className="msLabel">Unemployment</div>
            <div className="msVal c-warn">5.4<span style={{ fontSize: 13 }}>%</span></div>
            <div className="msTrend" style={{ color: 'var(--red)' }}>▲ 0.2 vs Q3</div>
          </div>
          <div className="msCell">
            <div className="msLabel">Inflation</div>
            <div className="msVal c-warn">5.1<span style={{ fontSize: 13 }}>%</span></div>
            <div className="msTrend" style={{ color: 'var(--green)' }}>▼ 1.3 vs Q3</div>
          </div>
          <div className="msCell">
            <div className="msLabel">Net Salary</div>
            <div className="msVal c-a">5.18<span style={{ fontSize: 13 }}>k</span></div>
            <div className="msTrend" style={{ color: 'var(--green)' }}>▲ 8.2% y/y</div>
          </div>
          <div className="msCell">
            <div className="msLabel">GDP/capita</div>
            <div className="msVal c-a2">14.8<span style={{ fontSize: 13 }}>k€</span></div>
            <div className="msTrend" style={{ color: 'var(--green)' }}>▲ 3.1% vs '22</div>
          </div>
        </div>
      </div>
    </div>
  )
}
