// GET /api/earthquakes — Vercel Serverless Function (logic lives in server/handlers.js)
const { earthquakes, getOnly } = require('../server/handlers');

module.exports = getOnly(earthquakes);
