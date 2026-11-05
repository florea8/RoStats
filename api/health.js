// GET /api/health — Vercel Serverless Function (logic lives in server/handlers.js)
const { health, getOnly } = require('../server/handlers');

module.exports = getOnly(health);
