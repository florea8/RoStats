const { CITY_IDS, CITY_BY_ID } = require('./cities');

// Used when OWM_KEY is missing or OpenWeatherMap is unreachable.
// Responses carry source: 'demo' so the UI can label them.
const DEMO_WEATHER = {
  bucuresti: { temp: 14, feels_like: 12, humidity: 65, description: 'partly cloudy', wind: 5 },
  cluj:      { temp: 10, feels_like: 8,  humidity: 72, description: 'light rain',    wind: 7 },
  timisoara: { temp: 16, feels_like: 14, humidity: 55, description: 'clear sky',     wind: 4 },
  iasi:      { temp: 11, feels_like: 9,  humidity: 70, description: 'overcast',      wind: 6 },
  constanta: { temp: 12, feels_like: 10, humidity: 78, description: 'windy, cloudy', wind: 12 },
  brasov:    { temp: 8,  feels_like: 6,  humidity: 80, description: 'fog',           wind: 3 },
};

/** Current weather for one city from OpenWeatherMap, or null if it can't be fetched. */
async function fetchCity(city, apiKey) {
  try {
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?id=${CITY_BY_ID[city].owmId}&appid=${apiKey}&units=metric&lang=en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;

    const data = await res.json();
    return {
      temp:        Math.round(data.main.temp),
      feels_like:  Math.round(data.main.feels_like),
      humidity:    data.main.humidity,
      description: data.weather[0].description,
      wind:        Math.round(data.wind.speed),
    };
  } catch {
    return null;
  }
}

/**
 * Current weather for the given cities, fetched in parallel.
 * Returns { data: { cluj: {...}, ... }, source: 'live' | 'demo' }.
 * Never throws: any city that can't be fetched gets demo values and the
 * whole response is tagged source: 'demo'.
 */
async function getWeather(cities = CITY_IDS) {
  const apiKey = process.env.OWM_KEY;
  const results = apiKey
    ? await Promise.all(cities.map(city => fetchCity(city, apiKey)))
    : cities.map(() => null);

  const data = {};
  let source = 'live';
  cities.forEach((city, i) => {
    data[city] = results[i] ?? DEMO_WEATHER[city];
    if (!results[i]) source = 'demo';
  });
  return { data, source };
}

module.exports = { getWeather };
