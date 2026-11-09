require('dotenv').config();
const { createApp } = require('./app');

const PORT = process.env.PORT || 3001;

createApp().listen(PORT, () => {
  console.log(`RoStats server running on port ${PORT}`);
});
