// server.js
const express = require('express');
const booru = require('booru');
const cors = require('cors');
const axios = require('axios'); // Using axios instead of node-fetch

const app = express();
const port = 9090;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    console.log('Query Parameters:', req.query);
    console.log('Headers:', req.headers);
    console.log('---');
    next();
});

// Serve static files
app.use(express.static('public'));

// Proxy endpoint to handle CORS issues using axios
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing url parameter.' });
    }

    try {
        const response = await axios.get(targetUrl);
        res.json(response.data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ 
            error: 'Error fetching data.', 
            details: error.message 
        });
    }
});

// Your existing search endpoint
app.get('/search', async (req, res) => {
    const { tags, site, page, rating } = req.query;
    console.log('Search request received:', {
        tags,
        site,
        page,
        rating,
        timestamp: new Date().toISOString()
    });
    
    if (!tags || !site || !page || !rating) {
        return res.status(400).json({ error: 'Missing query parameters.' });
    }

    try {
        const results = await booru.search(site, [tags], { 
            limit: 100, 
            page: parseInt(page), 
            rating: rating 
        });
        res.json(results);
    } catch (error) {
        console.error('Booru search error:', error);
        res.status(500).json({ 
            error: 'Error performing search.', 
            details: error.message 
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message 
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log('You can now open your HTML file and it will connect to this server.');
});