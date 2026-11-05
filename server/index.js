const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const handlers = require('./handlers');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security middleware ──
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET'],
}));

app.use(express.json({ limit: '10kb' }));

// ── Rate limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again in 15 minutes.' },
});
app.use('/api', limiter);

// ── Routes (same handlers as the Vercel functions in /api) ──
app.get('/api/weather',             handlers.weather);
app.get('/api/earthquakes',         handlers.earthquakes);
app.get('/api/aqi',                 handlers.aqi);
app.get('/api/history/aqi',         handlers.aqiHistory);
app.get('/api/history/earthquakes', handlers.earthquakeHistory);
app.get('/api/health',              handlers.health);

// ── 404 handler ──
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Error handler ──
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`RoStats server running on port ${PORT}`);
});
