// The city list lives in shared/cities.json and is used by both the API and the frontend.
const CITIES = require('../../shared/cities.json');

const CITY_IDS = CITIES.map(c => c.id);
const CITY_BY_ID = Object.fromEntries(CITIES.map(c => [c.id, c]));

module.exports = { CITIES, CITY_IDS, CITY_BY_ID };
