import { useQuery } from '@tanstack/react-query'

const CITIES = ['bucuresti', 'cluj', 'timisoara', 'iasi', 'constanta', 'brasov']

// Fallback demo data when API key is not configured
const DEMO = {
  bucuresti: { temp: 14, feels_like: 12, humidity: 65, description: 'partly cloudy', wind: 5 },
  cluj:      { temp: 10, feels_like: 8,  humidity: 72, description: 'light rain',    wind: 7 },
  timisoara: { temp: 16, feels_like: 14, humidity: 55, description: 'clear sky',     wind: 4 },
  iasi:      { temp: 11, feels_like: 9,  humidity: 70, description: 'overcast',      wind: 6 },
  constanta: { temp: 12, feels_like: 10, humidity: 78, description: 'windy, cloudy', wind: 12 },
  brasov:    { temp: 8,  feels_like: 6,  humidity: 80, description: 'fog',           wind: 3 },
}

async function fetchAllWeather() {
  const apiBase = import.meta.env.VITE_API_BASE || ''

  const results = await Promise.allSettled(
    CITIES.map(city =>
      fetch(`${apiBase}/api/weather?city=${city}`).then(r => {
        if (!r.ok) throw new Error('weather fetch failed')
        return r.json()
      })
    )
  )

  const data = {}
  results.forEach((r, i) => {
    const city = CITIES[i]
    data[city] = r.status === 'fulfilled' ? r.value : DEMO[city]
  })
  return data
}

export function useWeather() {
  return useQuery({
    queryKey: ['weather'],
    queryFn: fetchAllWeather,
    refetchInterval: 10 * 60 * 1000,
    staleTime: 9 * 60 * 1000,
    placeholderData: DEMO,
  })
}
