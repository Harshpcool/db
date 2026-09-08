const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const mongoUrl = process.env.MONGODB_URI; // Your Atlas connection string
const client = new MongoClient(mongoUrl);
let db;

client.connect().then(() => {
  db = client.db('cookies_db');
});

// Store cookies
app.post('/api/store-cookies', async (req, res) => {
  const { cookies, url } = req.body;
  
  const result = await db.collection('cookies').insertOne({
    cookies,
    url,
    timestamp: new Date()
  });
  
  res.json({ success: true, id: result.insertedId });
});

// Get cookies
app.get('/api/cookies/:id', async (req, res) => {
  const { ObjectId } = require('mongodb');
  const data = await db.collection('cookies').findOne({ 
    _id: new ObjectId(req.params.id) 
  });
  
  res.json(data || { error: 'Not found' });
});

app.listen(3000);
