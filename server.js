const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const mongoUrl = process.env.MONGODB_URI;
const client = new MongoClient(mongoUrl, {
  serverSelectionTimeoutMS: 5000, // fail fast instead of hanging forever
});
let db;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', dbConnected: !!db });
});

app.post('/api/store-cookies', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not ready' });
  try {
    const { cookies, url } = req.body;
    const result = await db.collection('cookies').insertOne({
      cookies, url, timestamp: new Date()
    });
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Store error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cookies/:id', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'Database not ready' });
  try {
    const data = await db.collection('cookies').findOne({
      _id: new ObjectId(req.params.id)
    });
    res.json(data || { error: 'Not found' });
  } catch (error) {
    console.error('Get error:', error);
    res.status(500).json({ error: error.message });
  }
});

// IMPORTANT: Railway injects its own PORT env var — always use that,
// never hardcode 3000/8080. Binding to '0.0.0.0' (not localhost) is
// required so Railway's proxy can actually reach the process.
const PORT = process.env.PORT;
if (!PORT) {
  console.error('✗ No PORT env var set by platform — this will likely cause a 502.');
}

app.listen(PORT || 3000, '0.0.0.0', () => {
  console.log(`✓ Server running on port ${PORT || 3000} (bound to 0.0.0.0)`);
});

client.connect()
  .then(() => {
    db = client.db('cookies_db');
    console.log('✓ Connected to MongoDB');
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
  });
