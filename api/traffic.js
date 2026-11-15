// GET /api/traffic — Vercel Serverless Function (logic lives in server/handlers.js)
const { traffic, getOnly } = require('../server/handlers');

module.exports = getOnly(traffic);
