const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Allow CORS for your frontend and Render domain
app.use(cors({
  origin: [
    'http://localhost:3000', // local dev
    'https://god-sown-phone-gadget.onrender.com' // your Render domain
  ],
  credentials: true
}));

app.use(express.json());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Example root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// You can add your /register and other API routes here

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
