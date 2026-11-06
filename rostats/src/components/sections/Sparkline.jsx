import { useEffect, useRef } from 'react'
import { withAlpha } from '../../utils/colors'

const HEIGHT = 54
const PAD = 6

function draw(canvas, values, color) {
  const ctx = canvas.getContext('2d')
  const W = canvas.offsetWidth || 200
  canvas.width = W
  canvas.height = HEIGHT

  const min = Math.min(...values)
  const range = Math.max(...values) - min || 1
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * (W - PAD * 2) + PAD,
    y: HEIGHT - PAD - ((v - min) / range) * (HEIGHT - PAD * 2),
  }))
  const last = pts[pts.length - 1]

  ctx.clearRect(0, 0, W, HEIGHT)

  // Filled area under the line
  ctx.beginPath()
  ctx.moveTo(pts[0].x, HEIGHT)
  pts.forEach(p => ctx.lineTo(p.x, p.y))
  ctx.lineTo(last.x, HEIGHT)
  ctx.closePath()
  ctx.fillStyle = withAlpha(color, 0.12)
  ctx.fill()

  // Line
  ctx.beginPath()
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
  ctx.strokeStyle = color
  ctx.lineWidth = 1.8
  ctx.stroke()

  // Dot on the latest value
  ctx.beginPath()
  ctx.arc(last.x, last.y, 3.5, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

/** Small canvas line chart; needs at least two values. */
export default function Sparkline({ values, color }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && values.length >= 2) draw(ref.current, values, color)
  }, [values, color])

  return <canvas ref={ref} height={HEIGHT} style={{ width: '100%', display: 'block' }} />
}
