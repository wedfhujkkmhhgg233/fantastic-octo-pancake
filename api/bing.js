const express = require('express');
const { bing } = require('nayan-bing-api');

const router = express.Router();
const key = "Nayan"; 
const cookie = "1d6krfybFWYR3cxvOkhT9Tnos4wDZ61Ark2DbT1HuKpDcebTJ55KqxvVg_xvs8WuFalZQBCZ9zB6j_nHaNyt2DKsarkKDMJZeTepeWetPCmShmJ_KlKgC2L9xI92NKlt_XjFnXzwryEBZYDU4vg0-BnYBeEtVREDzRENgJOttD4mc-7h_4xgB6rko2FYBculfq42bCPVhEjXYds3L-gZFqR0d0X61YyCReY5geJJGdM0";

router.get('/bing', async (req, res) => {
    const prompt = req.query.prompt; 

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const data = await bing(prompt, cookie, key);
        res.json({
            success: true,
            author: "Jerome",
            result: data.result 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching data from Bing.' });
    }
});

const serviceMetadata = {
    name: "Imagine",
    author: "Jerome",
    description: "Image generator",
    category: "Image",
    link: ["/service/api/bing?prompt="]
};

module.exports = { router, serviceMetadata };
                                
