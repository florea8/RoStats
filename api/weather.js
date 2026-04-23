const { z } = require('zod');

const CITY_IDS = {
  bucuresti: 683506,
  cluj:      681290,
  timisoara: 665087,
  iasi:      675466,
  constanta: 681964,
  brasov:    684082,
};

const VALID_CITIES = Object.keys(CITY_IDS);

const querySchema = z.object({
  city: z.enum(VALID_CITIES),
});

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const result = querySchema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid parameter. city must be one of: ' + VALID_CITIES.join(', '),
    });
  }

  const { city } = result.data;
  const apiKey = process.env.OWM_KEY;

  if (!apiKey) {
    return res.status(503).json({ error: 'OpenWeatherMap API key is not configured.' });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?id=${CITY_IDS[city]}&appid=${apiKey}&units=metric&lang=en`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({ error: 'OpenWeatherMap request failed.' });
    }

    const data = await response.json();

    res.json({
      city,
      temp:        Math.round(data.main.temp),
      feels_like:  Math.round(data.main.feels_like),
      humidity:    data.main.humidity,
      description: data.weather[0].description,
      wind:        Math.round(data.wind.speed),
    });
  } catch {
    res.status(502).json({ error: 'Could not reach OpenWeatherMap.' });
  }
};
