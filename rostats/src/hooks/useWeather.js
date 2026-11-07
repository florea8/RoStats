import { useQuery } from '@tanstack/react-query'
import { getJson } from '../utils/api'

// One request returns every city. The API falls back to demo values itself
// (source: 'demo'), so a failed request here means the backend is unreachable.
export function useWeather() {
  const query = useQuery({
    queryKey: ['weather'],
    queryFn: () => getJson('/api/weather'),
    refetchInterval: 10 * 60 * 1000,
    staleTime: 9 * 60 * 1000,
  })

  return {
    ...query,
    data: query.data?.data,
    source: query.data?.source,
  }
}
