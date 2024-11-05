const express = require('express');
const google = require('googlethis');

const router = express.Router();

router.get('/gimage', async (req, res) => {
    const query = req.query.query;
    const count = parseInt(req.query.count) || 6; // Default to 6 if count is not provided

    if (!query) {
        return res.status(400).json({
            error: "Please add ?query=your_search_query"
        });
    }

    const options = {
        safe: false // Adjust based on desired safe search preference
    };

    try {
        const response = await google.image(query, options);

        if (response.length === 0) {
            return res.status(404).json({
                error: "No images found for the specified query."
            });
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response.slice(0, count), null, 2)); // Limit results based on count parameter

    } catch (error) {
        console.error("Error searching for images:", error);
        res.status(500).json({
            error: "Failed to search for images."
        });
    }
});

const serviceMetadata = {
    name: "Google Image Search",
    author: "Jerome",
    description: "Search for images using Google",
    category: "tools",
    link: ["/api/gimage?query=dog&count=5"]
};

module.exports = { router, serviceMetadata };
