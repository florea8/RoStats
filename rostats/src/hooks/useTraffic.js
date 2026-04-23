import { useQuery } from '@tanstack/react-query'

const ROUTES = [
  { name: 'A1  BUC – PITEȘTI',   states: ['FREE', 'FREE', 'SLOW', 'FREE'] },
  { name: 'A2  BUC – CONSTANȚA', states: ['SLOW', 'SLOW', 'HEAVY', 'SLOW'] },
  { name: 'A3  BUC – CLUJ',      states: ['FREE', 'FREE', 'FREE', 'SLOW'] },
  { name: 'DN1 BUC – BRAȘOV',    states: ['SLOW', 'HEAVY', 'SLOW', 'FREE'] },
  { name: 'DN7 RM.VÂL – SIBIU',  states: ['FREE', 'FREE', 'FREE', 'FREE'] },
]

function estimateTraffic() {
  const h = new Date().getHours()
  const isPeak = (h >= 7 && h <= 9) || (h >= 16 && h <= 19)

  return ROUTES.map(r => {
    const idx = isPeak
      ? Math.floor(Math.random() * 2 + 1)
      : Math.floor(Math.random() * 2)
    return { name: r.name, status: r.states[idx] ?? r.states[0] }
  })
}

export function useTraffic() {
  return useQuery({
    queryKey: ['traffic'],
    queryFn: estimateTraffic,
    refetchInterval: 2 * 60 * 1000,
    staleTime: 90 * 1000,
  })
}
