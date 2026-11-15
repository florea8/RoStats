import { useEffect, useRef } from 'react'
import { reducedMotion, startCanvasLoop } from './canvasLoop'

const GAP = 26            // distance between dots
const REACH = 170         // how far the pointer disturbs the field
const RIPPLE_SPEED = 520  // px per second
const RIPPLE_S = 2.6
const TAU = Math.PI * 2

/**
 * Field of dots behind the indicators board. A slow swell passes through
 * it, a ripple opens when the board appears and wherever it is clicked,
 * and the dots lean away from the pointer. With reduced motion the board
 * shows a still dot grid from CSS instead.
 */
export default function DotField() {
  const ref = useRef(null)

  useEffect(() => {
    if (reducedMotion()) return
    const canvas = ref.current
    const host = canvas.parentElement
    const pointer = { x: -9999, y: -9999 }
    const ripples = []

    const locate = event => {
      const box = canvas.getBoundingClientRect()
      return { x: event.clientX - box.left, y: event.clientY - box.top }
    }
    const move = event => Object.assign(pointer, locate(event))
    const leave = () => Object.assign(pointer, { x: -9999, y: -9999 })
    const press = event => ripples.push({ ...locate(event), start: performance.now() })

    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', leave)
    host.addEventListener('pointerdown', press)

    let opened = false
    const stop = startCanvasLoop(canvas, (ctx, { now, width, height }) => {
      if (!opened) {
        opened = true
        ripples.push({ x: width / 2, y: Math.min(height, 700) / 2, start: now })
      }
      while (ripples.length && now - ripples[0].start > RIPPLE_S * 1000) ripples.shift()
      const t = now / 1000
      ctx.fillStyle = '#F2F0EA'

      for (let gy = GAP / 2; gy < height; gy += GAP) {
        for (let gx = GAP / 2; gx < width; gx += GAP) {
          // Slow swell crossing the field.
          let light = 0.07 + 0.11 * (0.5 + 0.5 * Math.sin(gx * 0.011 + gy * 0.007 - t * 0.7)) ** 2
          let x = gx
          let y = gy
          let size = 1

          for (const ripple of ripples) {
            const age = (now - ripple.start) / 1000
            const distance = Math.hypot(gx - ripple.x, gy - ripple.y)
            const front = Math.exp(-(((distance - age * RIPPLE_SPEED) / 46) ** 2)) * (1 - age / RIPPLE_S)
            light += front * 0.55
            size += front * 0.9
          }

          const dx = gx - pointer.x
          const dy = gy - pointer.y
          const distance = Math.hypot(dx, dy)
          if (distance < REACH) {
            const pull = (1 - distance / REACH) ** 2
            light += pull * 0.6
            size += pull * 1.1
            x += (dx / (distance || 1)) * pull * 9
            y += (dy / (distance || 1)) * pull * 9
          }

          ctx.globalAlpha = Math.min(1, light)
          ctx.beginPath()
          ctx.arc(x, y, size, 0, TAU)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    })

    return () => {
      stop()
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
      host.removeEventListener('pointerdown', press)
    }
  }, [])

  return <canvas className="dotField" ref={ref} aria-hidden="true" />
}
