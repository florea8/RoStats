import { useQuery } from '@tanstack/react-query'
import { getJson } from '../utils/api'

const CITIES = ['bucuresti', 'cluj', 'timisoara', 'iasi', 'constanta', 'brasov']

// The API falls back to demo values itself (tagged source: 'demo'),
// so a failed request here means the backend is unreachable.
async function fetchAllWeather() {
  const results = await Promise.allSettled(
    CITIES.map(city => getJson(`/api/weather?city=${city}`))
  )

  if (results.every(r => r.status === 'rejected')) {
    throw new Error('Weather API unreachable')
  }

  const data = {}
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') data[CITIES[i]] = r.value
  })
  return data
}

export function useWeather() {
  const query = useQuery({
    queryKey: ['weather'],
    queryFn: fetchAllWeather,
    refetchInterval: 10 * 60 * 1000,
    staleTime: 9 * 60 * 1000,
  })

  const values = Object.values(query.data ?? {})
  const source = values.length === 0
    ? undefined
    : values.every(w => w.source === 'live') ? 'live' : 'demo'

  return { ...query, source }
}
