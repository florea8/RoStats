// GET /api/weather (all cities) or /api/weather?city=cluj — Vercel Serverless Function (logic lives in server/handlers.js)
const { weather, getOnly } = require('../server/handlers');

module.exports = getOnly(weather);
