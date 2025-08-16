const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Connection error:', err);
    process.exit(1);
  });
