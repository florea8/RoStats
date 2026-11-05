import { useQuery } from '@tanstack/react-query'

// SIMULATED: there is no live traffic feed yet. Each route has a typical
// state for off-peak, normal and rush hours; the UI labels this as simulated.
const ROUTES = [
  { name: 'A1  BUC – PITEȘTI',   offPeak: 'FREE', normal: 'FREE', rush: 'SLOW'  },
  { name: 'A2  BUC – CONSTANȚA', offPeak: 'FREE', normal: 'SLOW', rush: 'HEAVY' },
  { name: 'A3  BUC – CLUJ',      offPeak: 'FREE', normal: 'FREE', rush: 'SLOW'  },
  { name: 'DN1 BUC – BRAȘOV',    offPeak: 'FREE', normal: 'SLOW', rush: 'HEAVY' },
  { name: 'DN7 RM.VÂL – SIBIU',  offPeak: 'FREE', normal: 'FREE', rush: 'SLOW'  },
]

function period(hour) {
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) return 'rush'
  if (hour >= 22 || hour <= 5) return 'offPeak'
  return 'normal'
}

function simulateTraffic() {
  const p = period(new Date().getHours())
  return ROUTES.map(r => ({ name: r.name, status: r[p] }))
}

export function useTraffic() {
  const query = useQuery({
    queryKey: ['traffic'],
    queryFn: simulateTraffic,
    refetchInterval: 5 * 60 * 1000,
  })
  return { ...query, source: 'simulated' }
}
