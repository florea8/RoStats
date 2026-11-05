// GET /api/aqi — Vercel Serverless Function (logic lives in server/handlers.js)
const { aqi, getOnly } = require('../server/handlers');

module.exports = getOnly(aqi);
