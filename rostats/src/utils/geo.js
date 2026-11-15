import { CITIES } from '../data/cities'

const EARTH_RADIUS_KM = 6371
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
const rad = deg => (deg * Math.PI) / 180

function distanceKm(lat1, lng1, lat2, lng2) {
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

/** Compass point of (lat2, lng2) as seen from (lat1, lng1). */
function direction(lat1, lng1, lat2, lng2) {
  const y = Math.sin(rad(lng2 - lng1)) * Math.cos(rad(lat2))
  const x = Math.cos(rad(lat1)) * Math.sin(rad(lat2))
    - Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(rad(lng2 - lng1))
  const bearing = (Math.atan2(y, x) * 180) / Math.PI
  return COMPASS[Math.round(((bearing + 360) % 360) / 45) % 8]
}

/**
 * Where a point lies relative to the nearest monitored city, e.g.
 * "58 km E of Brașov". The earthquake feed only names the country, so this
 * is the readable location.
 */
export function nearCity(lat, lng) {
  let nearest = null
  let best = Infinity
  for (const city of CITIES) {
    const km = distanceKm(city.lat, city.lng, lat, lng)
    if (km < best) {
      best = km
      nearest = city
    }
  }
  if (best < 5) return nearest.name
  return `${Math.round(best)} km ${direction(nearest.lat, nearest.lng, lat, lng)} of ${nearest.name}`
}
