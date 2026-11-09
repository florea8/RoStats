// Express app for local development. Kept separate from index.js (which only
// starts listening) so tests can create the app without opening a fixed port.
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const handlers = require('./handlers');

function createApp() {
  const app = express();

  // ── Security middleware ──
  app.use(helmet());
  app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET'],
  }));

  // ── Rate limiting ──
  app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: 'Too many requests, please try again in 15 minutes.' },
  }));

  // ── Routes (same handlers as the Vercel functions in /api) ──
  app.get('/api/weather',             handlers.weather);
  app.get('/api/earthquakes',         handlers.earthquakes);
  app.get('/api/aqi',                 handlers.aqi);
  app.get('/api/history/aqi',         handlers.aqiHistory);
  app.get('/api/history/earthquakes', handlers.earthquakeHistory);
  app.get('/api/health',              handlers.health);

  // ── 404 handler ──
  app.use((_req, res) => {
    res.status(404).json({ ok: false, error: 'Route not found.' });
  });

  // ── Error handler ──
  app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ ok: false, error: 'Internal server error.' });
  });

  return app;
}

module.exports = { createApp };
