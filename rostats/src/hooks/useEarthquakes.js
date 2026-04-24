import { useQuery } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_BASE || ''

async function fetchEarthquakes() {
  const res = await fetch(`${API_BASE}/api/earthquakes`)
  if (!res.ok) throw new Error('Earthquakes fetch failed')
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'API error')
  return json.data
}

export function useEarthquakes() {
  return useQuery({
    queryKey: ['earthquakes'],
    queryFn: fetchEarthquakes,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
  })
}
