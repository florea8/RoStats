const express = require('express');
const { fetchAndSaveEarthquakes } = require('../lib/usgs');

const router = express.Router();

// GET /api/earthquakes
router.get('/', async (req, res) => {
  try {
    const features = await fetchAndSaveEarthquakes();
    res.json({ ok: true, data: features, count: features.length });
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
});

module.exports = router;
