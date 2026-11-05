// GET /api/history/aqi?city=bucuresti&hours=24 — Vercel Serverless Function (logic lives in server/handlers.js)
const { aqiHistory, getOnly } = require('../../server/handlers');

module.exports = getOnly(aqiHistory);
