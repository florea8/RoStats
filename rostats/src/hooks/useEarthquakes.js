import { useQuery } from '@tanstack/react-query'

const EQ_URL =
  'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson' +
  '&minlatitude=43.5&maxlatitude=48.5&minlongitude=20.0&maxlongitude=30.0' +
  '&minmagnitude=1.0&orderby=time&limit=12'

async function fetchEarthquakes() {
  const res = await fetch(EQ_URL)
  if (!res.ok) throw new Error('USGS fetch failed')
  const json = await res.json()
  return json.features
}

export function useEarthquakes() {
  return useQuery({
    queryKey: ['earthquakes'],
    queryFn: fetchEarthquakes,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
  })
}
