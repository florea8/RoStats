// GET /api/indicators — Vercel Serverless Function (logic lives in server/handlers.js)
const { indicators, getOnly } = require('../server/handlers');

module.exports = getOnly(indicators);
