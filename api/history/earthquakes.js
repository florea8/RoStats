// GET /api/history/earthquakes?days=7 — Vercel Serverless Function (logic lives in server/handlers.js)
const { earthquakeHistory, getOnly } = require('../../server/handlers');

module.exports = getOnly(earthquakeHistory);
