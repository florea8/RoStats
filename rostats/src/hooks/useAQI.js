import { useQuery } from '@tanstack/react-query'
import { getJson } from '../utils/api'

export function useAQI() {
  // Current AQI per city. Open-Meteo updates hourly, so 10 min is plenty.
  const current = useQuery({
    queryKey: ['aqi'],
    queryFn: () => getJson('/api/aqi'),
    refetchInterval: 10 * 60 * 1000,
    staleTime: 9 * 60 * 1000,
  })

  // Real 24h trend for Bucharest, aggregated hourly from PostgreSQL.
  const history = useQuery({
    queryKey: ['aqi-history', 'bucuresti'],
    queryFn: () => getJson('/api/history/aqi?city=bucuresti&hours=24'),
    refetchInterval: 10 * 60 * 1000,
    staleTime: 9 * 60 * 1000,
  })

  return {
    ...current,
    data: current.data?.data,
    source: current.data?.source,
    aqiHistory: history.data?.data.map(row => row.avg_aqi) ?? [],
  }
}
