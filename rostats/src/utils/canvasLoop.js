/** Repeatable pseudo-random number in [0, 1) for an index, so particles keep their place between frames. */
export function rand(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Runs `draw(ctx, { now, width, height })` on every animation frame, with the
 * canvas kept at the size of its box and at the screen's pixel density.
 * Coordinates are CSS pixels. Returns a function that stops the loop.
 */
export function startCanvasLoop(canvas, draw) {
  const ctx = canvas.getContext('2d')
  let frame

  const tick = now => {
    const density = Math.min(window.devicePixelRatio || 1, 2)
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const w = Math.round(width * density)
    const h = Math.round(height * density)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    ctx.setTransform(density, 0, 0, density, 0, 0)
    ctx.clearRect(0, 0, width, height)
    draw(ctx, { now, width, height })
    frame = requestAnimationFrame(tick)
  }

  frame = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(frame)
}
