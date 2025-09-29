noconst fetch = require('node-fetch');

fetch('http://localhost:3000/api/send-custom-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    subject: 'Test Subject',
    message: 'This is a test message from Node.js script.'
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error('Error:', err));
