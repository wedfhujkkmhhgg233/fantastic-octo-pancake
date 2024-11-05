const express = require('express');
const DDG = require('duck-duck-scrape'); // Importing the DuckDuckGo library

const router = express.Router();

router.get('/search', async (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.status(400).json({ 
            error: "Please add ?query=your_search_query" 
        });
    }

    try {
        const searchResults = await DDG.search(query, { 
            safeSearch: DDG.SafeSearchType.STRICT 
        });

        if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
            return res.status(404).json({ 
                error: "No search results found" 
            });
        }

        // Extract the top 5 results or fewer if there are not enough results
        const formattedResults = searchResults.results.slice(0, 5).map(result => ({
            title: result.title,
            description: result.description.replace(/<\/?b>/g, ""), // Remove both opening and closing b tags
            source: result.hostname,
            url: result.url
        }));

        res.json({
            success: true,
            author: "Jerome",
            results: formattedResults
        });
        
    } catch (error) {
        console.error("Error performing search:", error);
        res.status(500).json({ 
            error: "Failed to perform search"
        });
    }
});

const serviceMetadata = {
    name: "DuckDuckGo Search",
    author: "Jerome",
    description: "Search for a topic on DuckDuckGo",
    category: "tools",
    link: ["/api/search?query=dog"]
};

module.exports = { router, serviceMetadata };
