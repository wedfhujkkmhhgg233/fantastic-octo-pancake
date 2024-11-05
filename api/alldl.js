import express from 'express';
import { alldown } from 'nayan-media-downloader';

const router = express.Router();

// /alldl endpoint to download media from various platforms
router.get('/alldl', async (req, res) => {
    const { url } = req.query; // Expecting the URL as a query parameter

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const data = await alldown(url);

        // Return the original response without modifications
        res.json(data);
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

export { router, serviceMetadata }; // Use export instead of module.exports
