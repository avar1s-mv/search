// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// API Endpoint
app.get('/api/tags', async (req, res) => {
  try {
    await client.connect();
    const database = client.db("booru");
    const collection = database.collection("tags");
    
    const tags = await collection.find({}, {
      projection: { _id: 0, name: 1, post_count: 1 }
    })
    .sort({ post_count: -1 })
    .limit(1000)
    .toArray();
    
    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Port Configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/api/tags`);
});