import { useEffect, useRef } from 'react'

const DURATION = 900
const easeOut = t => 1 - (1 - t) ** 4
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A number that runs up to its value when it appears and from the old value
 * to the new one when the data changes.
 *
 * The final text is what React renders, so it is correct without JavaScript
 * animation, for screen readers and with reduced motion; the effect only
 * rewrites the text node in between.
 */
export default function CountUp({ value, decimals = 0 }) {
  const ref = useRef(null)
  const shown = useRef(0)   // the value on screen once the last run finished
  const target = Number(value)
  const text = target.toFixed(decimals)

  useEffect(() => {
    const node = ref.current.firstChild
    const from = shown.current
    if (reducedMotion() || from === target) {
      shown.current = target
      return
    }

    let frame
    const start = performance.now()
    const step = now => {
      const t = Math.min(1, (now - start) / DURATION)
      node.nodeValue = (from + (target - from) * easeOut(t)).toFixed(decimals)
      if (t < 1) {
        frame = requestAnimationFrame(step)
      } else {
        shown.current = target
      }
    }
    frame = requestAnimationFrame(step)

    return () => cancelAnimationFrame(frame)
  }, [target, decimals])

  return <span ref={ref}>{text}</span>
}
