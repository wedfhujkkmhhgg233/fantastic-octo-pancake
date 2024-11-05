const express = require('express');
const gplay = require('google-play-scraper');

const router = express.Router();

router.get('/playstore', async (req, res) => {
    const term = req.query.term;

    if (!term) {
        return res.status(400).json({
            error: "Please add ?term=your_search_term"
        });
    }

    try {
        const results = await gplay.search({
            term: term,
            num: 10 // Fixed number of results
        });

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(results, null, 2)); // Pretty print the JSON response

    } catch (error) {
        console.error("Error searching Google Play Store:", error);
        res.status(500).json({
            error: "Failed to search Google Play Store."
        });
    }
});

const serviceMetadata = {
    name: "Google Play Store Search",
    author: "Jerome",
    description: "Search for apps on Google Play Store",
    category: "tools",
    link: ["/api/playstore?term=Facebook"]
};

module.e
xports = { router, serviceMetadata };
