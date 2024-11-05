const express = require('express');
const google = require('googlethis');

const router = express.Router();

router.get('/gimage', async (req, res) => {
    const query = req.query.query;

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
        res.send(JSON.stringify(response.slice(0, 6), null, 2)); // Limit to 6 results, pretty-printed

    } catch (error) {
        console.error("Error searching for images:", error);
        res.status(500).json({
            error: "Failed to search for images."
        });
    }
});

const serviceMetadata = {
    name: "Google Image Search",
    description: "Search for images using Google",
    category: "tools",
    link: ["/api/gimage?query=cat"]
};

module.exports = { router, serviceMetadata };
