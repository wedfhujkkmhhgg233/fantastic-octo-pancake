const express = require('express');
const duckduckgoSearch = require('duckduckgo-search');

const router = express.Router();

router.get('/search', async (req, res) => {
    const query = req.query.textQuery;

    if (!query) {
        return res.status(400).json({ 
            error: "Please provide ?textQuery= parameter." 
        });
    }

    try {
        const textResults = [];
        const imageResults = [];

        // Perform text search
        for await (const result of duckduckgoSearch.text(query)) {
            textResults.push(result); // Push raw result directly
        }

        // Perform image search
        for await (const result of duckduckgoSearch.images(query)) {
            imageResults.push(result); // Push raw result directly
        }

        // Return response with exact results
        res.json({
            success: true,
            author: "Jerome",
            textResults: textResults,
            imageResults: imageResults
        });

    } catch (error) {
        console.error("Error performing search:", error);
        res.status(500).json({ 
            error: "Failed to perform search" 
        });
    }
});

const serviceMetadata = {
    name: "DuckDuckGo Combined Search",
    author: "Jerome",
    description: "Search for both text and images on DuckDuckGo",
    category: "tools",
    link: ["/api/search?textQuery=example%20keywords"]
};

module.exports = { router, serviceMetadata };
