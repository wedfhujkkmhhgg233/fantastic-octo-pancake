// Import dependencies
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route to fetch word details from Wiktionary API
router.get('/wiktionary', async (req, res) => {
    const { word } = req.query;

    // Check if the word query parameter is provided
    if (!word) {
        return res.status(400).json({
            error: "Please add ?word=your_word"
        });
    }

    try {
        // Fetch data from the Wiktionary API
        const response = await axios.get(`https://en.wiktionary.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(word)}&prop=extracts&explaintext&redirects=1`);
        
        // Extract the relevant data
        const pages = response.data.query.pages;
        const pageId = Object.keys(pages)[0];
        const pageData = pages[pageId];

        // Check if the page exists
        if (pageData.missing) {
            return res.status(404).json({
                error: "No definitions found for the given word"
            });
        }

        // Create a structured response object
        const wordData = {
            word: word,
            definition: pageData.extract,
            source: "Wiktionary",
            requestTime: new Date().toISOString() // Add the time of the request for context
        };

        // Send the fetched data as JSON with pretty print
        res.setHeader('Content-Type', 'application/json');
        res.json(wordData);

    } catch (error) {
        console.error("Error fetching data from Wiktionary:", error.message);
        res.status(500).json({
            error: "Failed to retrieve word information from Wiktionary"
        });
    }
});

// Metadata for the Wiktionary API service
const serviceMetadata = {
    name: "Wiktionary API",
    author: "Jerome",
    description: "Fetch word details from Wiktionary API",
    category: "Search",
    link: ["/api/wiktionary?word=example"]
};

export { router, serviceMetadata };
