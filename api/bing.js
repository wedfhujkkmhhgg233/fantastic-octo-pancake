const express = require('express');
const { bing } = require('nayan-bing-api');

const router = express.Router();
const key = "Nayan"; // Don't change this key
const cookie = "1d6krfybFWYR3cxvOkhT9Tnos4wDZ61Ark2DbT1HuKpDcebTJ55KqxvVg_xvs8WuFalZQBCZ9zB6j_nHaNyt2DKsarkKDMJZeTepeWetPCmShmJ_KlKgC2L9xI92NKlt_XjFnXzwryEBZYDU4vg0-BnYBeEtVREDzRENgJOttD4mc-7h_4xgB6rko2FYBculfq42bCPVhEjXYds3L-gZFqR0d0X61YyCReY5geJJGdM0"; // Your Bing cookie here

// Endpoint to get Bing results based on user-provided prompt
router.get('/search', async (req, res) => {
    const prompt = req.query.prompt; // Get the prompt from the query parameters

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const data = await bing(prompt, cookie, key);
        res.json({
            success: true,
            author: "Jerome", // Replace with your name
            result: data.result // Assuming data.result contains the array of URLs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching data from Bing.' });
    }
});

// Service metadata for the service-list
const serviceMetadata = {
    name: "Imagine",
    author: "Jerome",
    description: "Image generator",
    category: "Image",
    link: ["/api/search"]
};

// Export the router and metadata
module.exports = { router, serviceMetadata };
