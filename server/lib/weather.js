const { CITY_IDS, CITY_BY_ID } = require('./cities');

// Open-Meteo Forecast API: no API key required, and one request returns the
// current conditions for every city asked for.
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const CURRENT_FIELDS = [
  'temperature_2m', 'apparent_temperature', 'relative_humidity_2m', 'weather_code', 'wind_speed_10m',
].join(',');

// WMO weather interpretation codes, as used by Open-Meteo.
const WMO_DESCRIPTIONS = {
  0: 'clear sky', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'fog', 48: 'freezing fog',
  51: 'light drizzle', 53: 'drizzle', 55: 'dense drizzle',
  56: 'freezing drizzle', 57: 'freezing drizzle',
  61: 'light rain', 63: 'rain', 65: 'heavy rain',
  66: 'freezing rain', 67: 'freezing rain',
  71: 'light snow', 73: 'snow', 75: 'heavy snow', 77: 'snow grains',
  80: 'light rain showers', 81: 'rain showers', 82: 'heavy rain showers',
  85: 'snow showers', 86: 'heavy snow showers',
  95: 'thunderstorm', 96: 'thunderstorm with hail', 99: 'thunderstorm with hail',
};

// Used when Open-Meteo is unreachable or leaves a city out.
// Responses carry source: 'demo' so the UI can label them.
const DEMO_WEATHER = {
  bucuresti: { temp: 14, feels_like: 12, humidity: 65, description: 'partly cloudy', wind: 5 },
  cluj:      { temp: 10, feels_like: 8,  humidity: 72, description: 'light rain',    wind: 7 },
  timisoara: { temp: 16, feels_like: 14, humidity: 55, description: 'clear sky',     wind: 4 },
  iasi:      { temp: 11, feels_like: 9,  humidity: 70, description: 'overcast',      wind: 6 },
  constanta: { temp: 12, feels_like: 10, humidity: 78, description: 'overcast',      wind: 12 },
  brasov:    { temp: 8,  feels_like: 6,  humidity: 80, description: 'fog',           wind: 3 },
  craiova:   { temp: 15, feels_like: 13, humidity: 60, description: 'mainly clear',  wind: 4 },
  galati:    { temp: 13, feels_like: 11, humidity: 68, description: 'partly cloudy', wind: 6 },
  oradea:    { temp: 14, feels_like: 12, humidity: 62, description: 'partly cloudy', wind: 3 },
  ploiesti:  { temp: 13, feels_like: 11, humidity: 66, description: 'overcast',      wind: 4 },
  braila:    { temp: 13, feels_like: 11, humidity: 70, description: 'partly cloudy', wind: 6 },
  arad:      { temp: 15, feels_like: 13, humidity: 58, description: 'clear sky',     wind: 3 },
  pitesti:   { temp: 12, feels_like: 10, humidity: 68, description: 'light drizzle', wind: 3 },
  bacau:     { temp: 10, feels_like: 8,  humidity: 74, description: 'overcast',      wind: 5 },
  sibiu:     { temp: 9,  feels_like: 7,  humidity: 76, description: 'mainly clear',  wind: 2 },
};

/** Current conditions in the shape the API returns, or null if the reading is incomplete. */
function toReading(current) {
  if (!current || typeof current.temperature_2m !== 'number') return null;
  return {
    temp:        Math.round(current.temperature_2m),
    feels_like:  Math.round(current.apparent_temperature),
    humidity:    current.relative_humidity_2m,
    description: WMO_DESCRIPTIONS[current.weather_code] ?? 'variable',
    wind:        Math.round(current.wind_speed_10m),
  };
}

/** Readings for the given cities, in the same order, with null for any that can't be fetched. */
async function fetchCities(cities) {
  try {
    const url =
      `${FORECAST_URL}?latitude=${cities.map(id => CITY_BY_ID[id].lat).join(',')}` +
      `&longitude=${cities.map(id => CITY_BY_ID[id].lng).join(',')}` +
      `&current=${CURRENT_FIELDS}&wind_speed_unit=ms&timezone=Europe%2FBucharest`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error('Open-Meteo request failed: ' + res.status);

    const json = await res.json();
    // Several locations come back as an array in the order asked; one comes back as an object.
    const locations = Array.isArray(json) ? json : [json];
    return cities.map((_, i) => toReading(locations[i]?.current));
  } catch (err) {
    console.error('Weather fetch failed, serving demo values:', err.message);
    return cities.map(() => null);
  }
}

/**
 * Current weather for the given cities, from one Open-Meteo request.
 * Returns { data: { cluj: {...}, ... }, source: 'live' | 'demo' }.
 * Never throws: any city without a reading gets demo values and the whole
 * response is tagged source: 'demo'.
 */
async function getWeather(cities = CITY_IDS) {
  const results = await fetchCities(cities);

  const data = {};
  let source = 'live';
  cities.forEach((city, i) => {
    data[city] = results[i] ?? DEMO_WEATHER[city];
    if (!results[i]) source = 'demo';
  });
  return { data, source };
}

module.exports = { getWeather };
