import { useQuery } from '@tanstack/react-query'
import { getJson } from '../utils/api'

export function useTraffic() {
  // Live readings come from TomTom and are cached by the API for 30 minutes;
  // without a key the API answers with typical states, marked simulated.
  const query = useQuery({
    queryKey: ['traffic'],
    queryFn: () => getJson('/api/traffic'),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
  })

  return { ...query, data: query.data?.data, source: query.data?.source }
}
