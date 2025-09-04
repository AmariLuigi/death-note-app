const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// YouTube webhook endpoint
app.post('/api/webhook', (req, res) => {
  try {
    const { username } = req.body;
    
    // Validate the incoming data
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Emit the new subscriber event to all connected clients
    io.emit('new_subscriber', { username });
    
    console.log('New subscriber:', username);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint to simulate a new subscriber
app.post('/api/test-subscriber', (req, res) => {
  try {
    const { username } = req.body;
    
    // Validate the incoming data
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Emit the new subscriber event to all connected clients
    io.emit('new_subscriber', { username });
    
    console.log('Test subscriber:', username);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing test subscriber:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});