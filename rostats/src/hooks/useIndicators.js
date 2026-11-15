import { useQuery } from '@tanstack/react-query'
import { getJson } from '../utils/api'

export function useIndicators() {
  // Eurostat publishes monthly at most; an hour between checks is plenty.
  const query = useQuery({
    queryKey: ['indicators'],
    queryFn: () => getJson('/api/indicators'),
    staleTime: 60 * 60 * 1000,
  })

  return { ...query, data: query.data?.data, source: query.data?.source }
}
