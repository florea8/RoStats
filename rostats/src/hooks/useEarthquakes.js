import { useQuery } from '@tanstack/react-query'
import { getJson } from '../utils/api'

export function useEarthquakes() {
  return useQuery({
    queryKey: ['earthquakes'],
    queryFn: () => getJson('/api/earthquakes').then(json => json.data),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
  })
}
