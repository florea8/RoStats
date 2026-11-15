// What the canvas over the map draws for each section. Every scene is a
// function called once per frame with:
//   ctx      2D context, in CSS pixels of the map
//   now      timestamp of the frame (ms)
//   project  [lat, lng] → { x, y } on the map as it is right now
//   data     the latest section data and the row picked in the panel
// Motion is always tied to a reading: nothing here moves for decoration only.
import { aqiColor, magColor } from '../../utils/colors'
import { markerRadius } from '../../utils/earthquakes'
import { wxCode } from '../../utils/weather'
import { CITIES } from '../../data/cities'
import { rand } from '../../utils/canvasLoop'
import { REPLAY_S, quakeMoment } from '../../utils/replay'

const TAU = Math.PI * 2
const easeOut = t => 1 - (1 - t) ** 3

function ring(ctx, { x, y }, radius, color, alpha, width) {
  if (alpha <= 0 || radius <= 0) return
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, TAU)
  ctx.stroke()
}

/* ── Earthquakes ────────────────────────────────────────────────────────
   The 30 days are replayed in a few seconds. As the replay reaches an
   event, a shockwave leaves its epicentre, reaching further for stronger
   events. Afterwards waves keep leaving the most recent one. */
const WAVE_S = 1.5
const MAX_WAVES = 150

function seismicScene() {
  let startedAt = null

  return (ctx, { now, project, data }) => {
    const { quakes, quakesAt } = data
    if (!quakes?.length) return
    startedAt ??= now
    const elapsed = (now - startedAt) / 1000

    for (const q of quakes.slice(0, MAX_WAVES)) {
      const age = elapsed - quakeMoment(q, quakesAt) * REPLAY_S
      if (age < 0 || age > WAVE_S) continue
      const point = project([q.lat, q.lng])
      const color = magColor(q.magnitude)
      const base = markerRadius(q.magnitude)
      const reach = 16 + q.magnitude * 18
      const k = age / WAVE_S
      ring(ctx, point, base + reach * easeOut(k), color, 1 - k, 2.5 * (1 - k) + 0.5)
      // A second, slower front behind the first.
      const k2 = (age - 0.22) / WAVE_S
      if (k2 > 0) ring(ctx, point, base + reach * 0.62 * easeOut(k2), color, (1 - k2) * 0.6, 1.5)
      // Flash at the epicentre as it fires.
      if (k < 0.25) {
        ctx.globalAlpha = (1 - k / 0.25) * 0.5
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(point.x, point.y, base + 10 * k * 4, 0, TAU)
        ctx.fill()
      }
    }

    if (elapsed > REPLAY_S) {
      const latest = quakes[0]
      const point = project([latest.lat, latest.lng])
      const color = magColor(latest.magnitude)
      for (let i = 0; i < 3; i++) {
        const k = ((elapsed - REPLAY_S) / 3.6 + i / 3) % 1
        ring(ctx, point, 4 + 40 * k, color, (1 - k) * 0.9, 1.5)
      }
    }
    ctx.globalAlpha = 1
  }
}

/* ── Traffic ────────────────────────────────────────────────────────────
   Streams of light run along each road. Free roads carry few, fast, long
   streaks; congested roads carry many, slow, short ones. */
const FLOW = {
  FREE:  { speed: 150, gap: 110, trail: 70 },
  SLOW:  { speed: 58,  gap: 60,  trail: 34 },
  HEAVY: { speed: 18,  gap: 28,  trail: 14 },
}

/** Point at distance `s` along a polyline given its points and cumulative lengths. */
function pointAlong(points, lengths, s) {
  let i = 1
  while (i < lengths.length - 1 && lengths[i] < s) i++
  const span = lengths[i] - lengths[i - 1] || 1
  const k = Math.min(1, Math.max(0, (s - lengths[i - 1]) / span))
  const a = points[i - 1]
  const b = points[i]
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }
}

function trafficScene() {
  return (ctx, { now, project, data }) => {
    const { roads, focus } = data
    if (!roads) return
    const picked = focus?.id.startsWith('road-') ? focus.id : null
    ctx.lineCap = 'round'

    for (const road of roads) {
      if (!road.path) continue
      const flow = FLOW[road.state.key] ?? FLOW.FREE
      const points = road.path.map(project)
      const lengths = [0]
      for (let i = 1; i < points.length; i++) {
        lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y))
      }
      const total = lengths.at(-1)
      const dim = picked && picked !== `road-${road.id}` ? 0.2 : 1
      const offset = ((now / 1000) * flow.speed) % flow.gap

      for (let s = offset; s < total; s += flow.gap) {
        const head = pointAlong(points, lengths, s)
        // The trail is drawn in short pieces that fade towards the tail, so it bends with the road.
        const pieces = 6
        for (let i = 0; i < pieces; i++) {
          const from = Math.max(0, s - flow.trail * ((i + 1) / pieces))
          const to = Math.max(0, s - flow.trail * (i / pieces))
          const a = pointAlong(points, lengths, from)
          const b = pointAlong(points, lengths, to)
          ctx.globalAlpha = dim * (1 - i / pieces) * 0.9
          ctx.strokeStyle = road.state.color
          ctx.lineWidth = 4 - i * 0.4
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
        ctx.globalAlpha = dim
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(head.x, head.y, 2, 0, TAU)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
  }
}

/* ── Air quality ────────────────────────────────────────────────────────
   Particles drift around each city inside its disc: the higher the index,
   the larger the disc and the more particles in the air. */
function aqiScene() {
  return (ctx, { now, project, data }) => {
    const { aqiData } = data
    if (!aqiData) return
    const t = now / 1000

    CITIES.forEach((city, c) => {
      const value = aqiData[city.id]
      if (value == null) return
      const { x, y } = project([city.lat, city.lng])
      const level = Math.min(value, 200)
      const radius = (28 + (level / 200) * 72) / 2
      const count = Math.round(8 + level / 4)
      ctx.fillStyle = aqiColor(value)

      for (let i = 0; i < count; i++) {
        const seed = c * 1000 + i
        const turn = rand(seed + 2) < 0.5 ? -1 : 1
        const angle = rand(seed) * TAU + t * (0.12 + rand(seed + 1) * 0.4) * turn
        const orbit = radius * (0.3 + rand(seed + 3) * 0.95) + Math.sin(t * 0.7 + seed) * 3
        ctx.globalAlpha = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.4 + seed * 2.1))
        ctx.beginPath()
        ctx.arc(x + Math.cos(angle) * orbit, y + Math.sin(angle) * orbit, 0.8 + rand(seed + 4) * 1.4, 0, TAU)
        ctx.fill()
      }
    })
    ctx.globalAlpha = 1
  }
}

/* ── Weather ────────────────────────────────────────────────────────────
   Each city shows its own sky: rain and snow fall where they are reported,
   rays turn where it is clear, streaks blow past where it is windy and fog
   bands slide where it is misty. */
const SKY_W = 68
const SKY_H = 68
const SKY_SHIFT = 46   // the patch sits left of the city's dot, clear of its label on the right
const INK = '#F2F0EA'

/** Fades a particle out towards the edge of a city's patch of sky. */
const edgeFade = (dx, dy) => Math.max(0, 1 - Math.hypot(dx / (SKY_W / 2), dy / (SKY_H / 2)) ** 2)

const SKIES = {
  RAIN(ctx, x, y, t, seed, drops = 18) {
    ctx.strokeStyle = INK
    ctx.lineWidth = 1.2
    for (let i = 0; i < drops; i++) {
      const dx = (rand(seed + i) - 0.5) * SKY_W
      const dy = ((t * (150 + rand(seed + i + 50) * 80) + rand(seed + i + 99) * SKY_H) % SKY_H) - SKY_H / 2
      ctx.globalAlpha = edgeFade(dx, dy) * 0.75
      ctx.beginPath()
      ctx.moveTo(x + dx, y + dy)
      ctx.lineTo(x + dx - 2, y + dy + 8)
      ctx.stroke()
    }
  },
  TSTM(ctx, x, y, t, seed) {
    SKIES.RAIN(ctx, x, y, t, seed, 24)
    // A short double flash every few seconds.
    const beat = (t + rand(seed) * 4) % 4
    if (beat < 0.08 || (beat > 0.16 && beat < 0.22)) {
      ctx.globalAlpha = 0.28
      ctx.fillStyle = INK
      ctx.beginPath()
      ctx.ellipse(x, y, SKY_W / 2, SKY_H / 2, 0, 0, TAU)
      ctx.fill()
    }
  },
  SNW(ctx, x, y, t, seed) {
    ctx.fillStyle = INK
    for (let i = 0; i < 16; i++) {
      const dy = ((t * (16 + rand(seed + i + 50) * 14) + rand(seed + i + 99) * SKY_H) % SKY_H) - SKY_H / 2
      const dx = (rand(seed + i) - 0.5) * SKY_W + Math.sin(t * 1.2 + i) * 5
      ctx.globalAlpha = edgeFade(dx, dy) * 0.85
      ctx.beginPath()
      ctx.arc(x + dx, y + dy, 1.4, 0, TAU)
      ctx.fill()
    }
  },
  CLR(ctx, x, y, t) {
    ctx.strokeStyle = INK
    ctx.lineWidth = 1.2
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * TAU + t * 0.25
      const reach = 22 + 5 * Math.sin(t * 1.6 + i * 1.7)
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(angle) * 11, y + Math.sin(angle) * 11)
      ctx.lineTo(x + Math.cos(angle) * reach, y + Math.sin(angle) * reach)
      ctx.stroke()
    }
  },
  WIND(ctx, x, y, t, seed) {
    ctx.strokeStyle = INK
    ctx.lineWidth = 1.2
    for (let i = 0; i < 9; i++) {
      const dy = (rand(seed + i) - 0.5) * SKY_H * 0.8
      const dx = ((t * (90 + rand(seed + i + 50) * 60) + rand(seed + i + 99) * SKY_W) % SKY_W) - SKY_W / 2
      ctx.globalAlpha = edgeFade(dx, dy) * 0.65
      ctx.beginPath()
      ctx.moveTo(x + dx, y + dy)
      ctx.lineTo(x + dx + 10 + rand(seed + i + 7) * 8, y + dy)
      ctx.stroke()
    }
  },
  FOG(ctx, x, y, t) {
    ctx.strokeStyle = INK
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    for (let i = 0; i < 4; i++) {
      const dy = (i - 1.5) * 9
      const slide = Math.sin(t * 0.5 + i * 1.3) * 10
      ctx.globalAlpha = 0.22
      ctx.beginPath()
      ctx.moveTo(x - 20 + slide * 0.6, y + dy)
      ctx.lineTo(x + 20 + slide * 0.6, y + dy)
      ctx.stroke()
    }
  },
}

function weatherScene() {
  return (ctx, { now, project, data }) => {
    const { wxData } = data
    if (!wxData) return
    const t = now / 1000

    CITIES.forEach((city, c) => {
      const reading = wxData[city.id]
      const sky = reading && SKIES[wxCode(reading.description)]
      if (!sky) return
      const { x, y } = project([city.lat, city.lng])
      sky(ctx, x - SKY_SHIFT, y, t, c * 1000)
    })
    ctx.globalAlpha = 1
  }
}

export const SCENES = {
  seismic: seismicScene,
  traffic: trafficScene,
  aqi:     aqiScene,
  weather: weatherScene,
}
