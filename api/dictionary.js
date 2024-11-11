import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: 'dictionary',
    author: 'Jerome Jamis',
    description: 'Fetches the definition of a word from a dictionary API.',
    category: 'Search',
    link: ["/api/dictionary?word="]  // Example URL with query parameter
};

// Dictionary Route
router.get('/dictionary', async (req, res) => {
    const word = req.query.word;

    if (!word) {
        return res.status(400).json({
            success: false,
            message: "Please provide a word to search."
        });
    }

    try {
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

        const formattedResponse = JSON.stringify({
            success: true,
            message: `Fetched definition for the word "${word}" successfully.`,
            data: response.data
        }, null, 2);

        res.type('json').send(formattedResponse);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Failed to fetch definition for the word "${word}".`,
            error: error.message
        });
    }
});

export { router, serviceMetadata };
