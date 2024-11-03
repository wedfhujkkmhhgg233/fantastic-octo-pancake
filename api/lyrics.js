const express = require('express');
const axios = require('axios');

const router = express.Router();

// Route to fetch lyrics for a given song title
router.get('/lyrics', async (req, res) => {
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ error: 'Song title is required' });
    }

    try {
        const apiUrl = `https://lyrist.vercel.app/api/${encodeURIComponent(title)}`;
        const response = await axios.get(apiUrl);

        // Check if the response contains the expected data
        if (!response.data || !response.data.lyrics) {
            return res.status(404).json({ error: 'Lyrics not found for this song' });
        }

        res.json({
            success: true,
            author: "Jerome",
            lyrics: response.data.lyrics,
            title: response.data.title,
            artist: response.data.artist,
            image: response.data.image
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching lyrics: ' + error.message });
    }
});

// Service metadata
const serviceMetadata = {
    name: "Lyrics Fetcher",
    author: "Jerome",
    description: "Fetches lyrics for a given song title",
    category: "Music",
    link: ["/api/lyrics?title="]
};

module.exports = { router, serviceMetadata };
