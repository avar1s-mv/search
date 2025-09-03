// cors-proxy.js
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Use axios instead

const app = express();
const port = 9090;

app.use(cors());
app.use(express.json());

// Proper headers to mimic a real browser
const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': 'https://example.com/'
};

app.get('/proxy', async (req, res) => {
    const { url } = req.query;
    
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const parsedUrl = new URL(url);
        const allowedDomains = ['danbooru.donmai.us', 'yande.re', 'gelbooru.com'];
        
        if (!allowedDomains.includes(parsedUrl.hostname)) {
            return res.status(403).json({ error: 'Domain not allowed' });
        }

        console.log('Proxying request to:', url);
        
        // Using axios instead of fetch
        const response = await axios.get(url, {
            headers: BROWSER_HEADERS,
            timeout: 15000,
            // Axios automatically handles JSON parsing
        });

        res.json(response.data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch data from target site',
            message: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`CORS proxy running at http://localhost:${port}`);
});