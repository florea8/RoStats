import { useRef, useEffect } from 'react'
import { magColor } from '../utils/colors'
import { timeAgo } from '../utils/time'

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
    drawSparkline(canvasRef.current, vals, '#f5a400', 'rgba(245,164,0,0.08)')
  }, [quakes])

  return (
    <div className="panel boot-fade d2" style={{ borderTop: '1px solid var(--line2)' }}>
      <div className="panel-head">
        <span className="ph-title">Seismic Activity · 7 days</span>
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
      <div className="spark-wrap">
        <div className="spark-label">
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
    <div className="panel-left boot-fade d2">
      {/* Earthquake list */}
      <div className="panel">
        <div className="panel-head">
          <span className="ph-title">Earthquakes · RO Zone</span>
          <a className="ph-src" href="https://earthquake.usgs.gov" target="_blank" rel="noreferrer">USGS ↗</a>
        </div>
      </div>

      <div className="panel-scroll">
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
            <div className="eq-row" key={i}>
              <div className="eq-bar" style={{ background: magColor(p.mag) }} />
              <div className="eq-mag" style={{ color: magColor(p.mag) }}>{mag}</div>
              <div className="eq-body">
                <div className="eq-place">{loc}</div>
                <div className="eq-meta">↓{depth}km · {timeAgo(p.time)}</div>
              </div>
            </div>
          )
        })}
      </div>

      <EqSparkline quakes={quakes} />

      {/* National stats */}
      <div className="panel">
        <div className="panel-head">
          <span className="ph-title">National Indicators</span>
          <a className="ph-src" href="https://insse.ro" target="_blank" rel="noreferrer">INS ↗</a>
        </div>
        <div className="ms-grid">
          <div className="ms-cell">
            <div className="ms-label">Unemployment</div>
            <div className="ms-val c-warn">5.4<span style={{ fontSize: 13 }}>%</span></div>
            <div className="ms-trend" style={{ color: 'var(--red)' }}>▲ 0.2 vs Q3</div>
          </div>
          <div className="ms-cell">
            <div className="ms-label">Inflation</div>
            <div className="ms-val c-warn">5.1<span style={{ fontSize: 13 }}>%</span></div>
            <div className="ms-trend" style={{ color: 'var(--a)' }}>▼ 1.3 vs Q3</div>
          </div>
          <div className="ms-cell">
            <div className="ms-label">Net Salary</div>
            <div className="ms-val c-a">5.18<span style={{ fontSize: 13 }}>k</span></div>
            <div className="ms-trend" style={{ color: 'var(--a)' }}>▲ 8.2% y/y</div>
          </div>
          <div className="ms-cell">
            <div className="ms-label">GDP/capita</div>
            <div className="ms-val c-a2">14.8<span style={{ fontSize: 13 }}>k€</span></div>
            <div className="ms-trend" style={{ color: 'var(--a)' }}>▲ 3.1% vs '22</div>
          </div>
        </div>
      </div>
    </div>
  )
}
