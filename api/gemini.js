const express = require('express');
const Gemini = require('@onepunya/ez-gemini');

const router = express.Router();
const apiKey = 'AIzaSyDF3ZSiDZt9Rg_0eeoPDDYozDu3UvoutNw';
const gemini = new Gemini(apiKey); // Using your personal API key

router.get('/gemini', async (req, res) => {
    const { ask, imgurl } = req.query;
    const response = {};

    try {
        if (ask) {
            if (imgurl) {
                const vision = await gemini.vision(imgurl, ask);
                response.vision = vision;
            } else {
                const textResponse = await gemini.pro(ask);
                response.textResponse = textResponse;
            }
        } else {
            response.message = 'The "ask" parameter is required.';
        }

        res.json(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Service metadata for /service-list endpoint
const serviceMetadata = {
    name: "GeminiService",
    author: "Jerome",
    description: "Gemini API Service for text and image processing",
    category: "AI Services",
    link: ["/api/gemini?ask=&imgurl="]
};

// Export the router and metadata
module.exports = { router, serviceMetadata };
