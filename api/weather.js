// GET /api/weather?city=cluj — Vercel Serverless Function (logic lives in server/handlers.js)
const { weather, getOnly } = require('../server/handlers');

module.exports = getOnly(weather);
