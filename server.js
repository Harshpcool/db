const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const mongoUrl = process.env.MONGODB_URI;
const client = new MongoClient(mongoUrl);
let db;

// Connect to MongoDB
client.connect().then(() => {
  db = client.db('cookies_db');
  console.log('✓ Connected to MongoDB');
}).catch(err => {
  console.error('✗ MongoDB connection error:', err);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Store cookies
app.post('/api/store-cookies', async (req, res) => {
  try {
    const { cookies, url } = req.body;
    
    const result = await db.collection('cookies').insertOne({
      cookies,
      url,
      timestamp: new Date()
    });
    
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cookies
app.get('/api/cookies/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const data = await db.collection('cookies').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    res.json(data || { error: 'Not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});
