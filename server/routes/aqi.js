const express = require('express');
const { fetchAndSaveAQI } = require('../lib/openaq');

const router = express.Router();

// GET /api/aqi
router.get('/', async (req, res) => {
  try {
    const data = await fetchAndSaveAQI();
    res.json({ ok: true, data });
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
});

module.exports = router;
