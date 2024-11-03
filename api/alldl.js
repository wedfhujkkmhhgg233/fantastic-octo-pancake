const express = require('express');
const { alldown } = require("nayan-media-downloader");

const router = express.Router();

// /alldl endpoint to download media from various platforms
router.get('/alldl', async (req, res) => {
    const { url } = req.query; // Expecting the URL as a query parameter

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const data = await alldown(url);
        
        // Construct the response
        res.json({
            success: true,
            author: "Jerome",
            status: data.status,
            media: {
                title: data.media.title,
                low: data.media.low,
                high: data.media.high
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing the download request.' });
    }
});

// Service metadata for the Alldl route
const serviceMetadata = {
    name: "Media Downloader",
    author: "Jerome",
    description: "Downloads media from various platforms.",
    category: "Media",
    link: ["/api/alldl?url="]
};

module.exports = { router, serviceMetadata };
