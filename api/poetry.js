import express from 'express';
import axios from 'axios';

const router = express.Router();

// Poetry endpoint
router.get('/poetry', async (req, res) => {
    const { type, titleorauthor } = req.query;

    // Check if 'type' is provided, if not return a guide message
    if (!type) {
        return res.status(400).json({
            error: "The 'type' parameter is required. Please provide one of the following values:",
            guide: {
                title: "Search poems by title. Use with 'titleorauthor' parameter, e.g., /poetry?type=title&titleorauthor=william",
                author: "Search poems by author. Use with 'titleorauthor' parameter, e.g., /poetry?type=author&titleorauthor=william",
                random: "Fetch a random poem. No 'titleorauthor' parameter needed, e.g., /poetry?type=random"
            }
        });
    }

    // Construct API URL based on type
    let apiUrl;
    switch (type) {
        case 'title':
            apiUrl = `https://poetrydb.org/title/${encodeURIComponent(titleorauthor)}`;
            break;
        case 'author':
            apiUrl = `https://poetrydb.org/author/${encodeURIComponent(titleorauthor)}`;
            break;
        case 'random':
            apiUrl = `https://poetrydb.org/random`;
            break;
        default:
            return res.status(400).json({ error: 'Invalid type parameter. Use "title", "author", or "random".' });
    }

    try {
        // Fetch data from the PoetryDB API
        const response = await axios.get(apiUrl);
        const poems = response.data.slice(0, 10);  // Limit to first 10 results

        // Prepare the pretty-printed response
        const poetryResponse = {
            author: "Poetry API",
            type: type,
            data: poems
        };

        // Send the formatted response with newlines
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(poetryResponse, null, 4));
    } catch (error) {
        console.error('Error fetching data from PoetryDB API:', error);
        res.status(500).json({ error: 'Error processing poetry request' });
    }
});

// Service metadata
const serviceMetadata = {
    name: "Poetry API",
    author: "Jerome-Web",
    description: "Fetches poems by title, author, or random selection",
    category: "Search",
    link: ["/api/poetry?type=&titleorauthor="]
};

export { router, serviceMetadata };
