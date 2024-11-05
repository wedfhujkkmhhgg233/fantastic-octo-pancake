const express = require('express');
const duckduckgoSearch = require('duckduckgo-search');

const router = express.Router();

router.get('/search', async (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.status(400).json({
            error: "Please add ?query=your_search_query"
        });
    }

    try {
        const results = [];
        for await (const result of duckduckgoSearch.text(query)) {
            results.push(result); // Directly push the result as-is from the package
        }

        if (results.length === 0) {
            return res.status(404).json({
                error: "No search results found"
            });
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(results, null, 2)); // Pretty-print JSON output

    } catch (error) {
        console.error("Error performing search:", error);
        res.status(500).json({
            error: "Failed to perform search"
        });
    }
});

const serviceMetadata = {
    name: "DuckDuckGo Search",
    description: "Search for a topic on DuckDuckGo",
    category: "tools",
    link: ["/api/search?query=who%20is%20Jose%20Rizal"]
};

module.exports = { router, serviceMetadata };
