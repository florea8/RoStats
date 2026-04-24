const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const weatherRouter     = require('./routes/weather');
const earthquakesRouter = require('./routes/earthquakes');
const aqiRouter         = require('./routes/aqi');
const historyRouter     = require('./routes/history');

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

// ── Routes ──
app.use('/api/weather',      weatherRouter);
app.use('/api/earthquakes',  earthquakesRouter);
app.use('/api/aqi',          aqiRouter);
app.use('/api/history',      historyRouter);

// ── Health check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
