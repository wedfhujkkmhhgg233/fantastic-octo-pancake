// Import dependencies
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route to fetch wikiHow article details
router.get('/wikihow', async (req, res) => {
    const { title } = req.query;

    // Check if the title query parameter is provided
    if (!title) {
        return res.status(400).json({
            error: "Please add ?title=your_article_title"
        });
    }

    try {
        // Fetch data from the wikiHow API
        const response = await axios.get(`https://www.wikihow.com/api.php?action=query&format=json&titles=${encodeURIComponent(title)}&prop=extracts|images|categories|links&explaintext&redirects=1`);
        
        // Extract the relevant data
        const pages = response.data.query.pages;
        const pageId = Object.keys(pages)[0];
        const pageData = pages[pageId];

        // Check if the page exists
        if (pageData.missing) {
            return res.status(404).json({
                error: "No article found for the given title"
            });
        }

        // Create a structured response object
        const wikiHowData = {
            title: pageData.title,
            extract: pageData.extract,
            images: pageData.images || [],
            categories: pageData.categories || [],
            links: pageData.links || [],
            source: "wikiHow",
            requestTime: new Date().toISOString() // Add the time of the request for context
        };

        // Send the fetched data as JSON with pretty print
        res.setHeader('Content-Type', 'application/json');
        res.json(wikiHowData);

    } catch (error) {
        console.error("Error fetching data from wikiHow:", error.message);
        res.status(500).json({
            error: "Failed to retrieve article information from wikiHow"
        });
    }
});

// Metadata for the wikiHow API service
const serviceMetadata = {
    name: "wikiHow API",
    author: "Jerome",
    description: "Fetch article details from wikiHow API",
    category: "how-to",
    link: ["/api/wikihow?title=how-to-do-something"]
};

export { router, serviceMetadata };
