// The replay of the last 30 days of earthquakes. The seismogram's playhead,
// the map markers and the shockwaves on the map all read their timing from
// here, so the three stay in step.
const DAY_MS = 86400000

export const REPLAY_DAYS = 30
export const REPLAY_S = 4          // how long the 30 days take to play
export const REPLAY_STEPS = 20     // markers appear in this many steps

/** Position of an earthquake within the replay window, 0 (30 days ago) to 1 (now). */
export function quakeMoment(quake, now) {
  const start = now - REPLAY_DAYS * DAY_MS
  const at = (Date.parse(quake.time) - start) / (REPLAY_DAYS * DAY_MS)
  return Math.min(1, Math.max(0, at))
}
