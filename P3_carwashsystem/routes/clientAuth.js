const express = require('express');
const router = express.Router();

// Simple in-memory storage for demo
let clients = []; // { name, email, username, password, bookings: [] }

router.post('/signup', (req, res) => {
  const { name, email, username, password } = req.body;
  if (!name || !email || !username || !password)
    return res.status(400).json({ message: 'All fields required.' });

  if (clients.find(c => c.username === username))
    return res.status(400).json({ message: 'Username already exists.' });

  clients.push({ name, email, username, password, bookings: [] });
  return res.json({ message: 'Signup successful.' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const client = clients.find(c => c.username === username && c.password === password);
  if (!client) return res.status(401).json({ message: 'Invalid credentials.' });
  res.json({ token: 'demo-client-token', name: client.name });
});

router.post('/book', (req, res) => {
  const { username, service, date, time, notes } = req.body;
  const client = clients.find(c => c.username === username);
  if (!client) return res.status(401).json({ message: 'Invalid client.' });

  client.bookings.push({ service, date, time, notes });
  res.json({ message: 'Booking confirmed.', bookings: client.bookings });
});

router.get('/bookings/:username', (req, res) => {
  const client = clients.find(c => c.username === req.params.username);
  if (!client) return res.status(404).json({ message: 'Client not found.' });
  res.json(client.bookings);
});

module.exports = router;