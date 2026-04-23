import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'

const AQI_BASE = {
  bucuresti: 42, cluj: 31, timisoara: 27,
  iasi: 58, constanta: 36, brasov: 22,
}

function generateAQI() {
  const data = {}
  Object.entries(AQI_BASE).forEach(([city, base]) => {
    data[city] = Math.max(5, Math.round(base + (Math.random() - 0.5) * 14))
  })
  return data
}

export function useAQI() {
  const historyRef = useRef(
    Array.from({ length: 16 }, () => Math.max(5, Math.round(42 + (Math.random() - 0.5) * 20)))
  )

  const query = useQuery({
    queryKey: ['aqi'],
    queryFn: () => {
      const data = generateAQI()
      historyRef.current = [...historyRef.current, data.bucuresti].slice(-24)
      return data
    },
    refetchInterval: 60 * 1000,
    staleTime: 55 * 1000,
  })

  return {
    ...query,
    aqiHistory: historyRef.current,
  }
}
