const { CITY_BY_ID } = require('./cities');

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

function demo(city) {
  return { city, ...DEMO_WEATHER[city], source: 'demo' };
}

/**
 * Current weather for one city from OpenWeatherMap.
 * Never throws: falls back to demo values tagged with source: 'demo'.
 */
async function getWeather(city) {
  const apiKey = process.env.OWM_KEY;
  if (!apiKey) return demo(city);

  try {
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?id=${CITY_BY_ID[city].owmId}&appid=${apiKey}&units=metric&lang=en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return demo(city);

    const data = await res.json();
    return {
      city,
      temp:        Math.round(data.main.temp),
      feels_like:  Math.round(data.main.feels_like),
      humidity:    data.main.humidity,
      description: data.weather[0].description,
      wind:        Math.round(data.wind.speed),
      source:      'live',
    };
  } catch {
    return demo(city);
  }
}

module.exports = { getWeather };
