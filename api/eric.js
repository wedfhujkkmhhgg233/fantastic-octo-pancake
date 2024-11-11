import express from 'express';
import axios from 'axios';

const router = express.Router();

// Eric search route
router.get('/eric', async (req, res) => {
    const { search = 'cat', rows = 5 } = req.query;

    try {
        // Construct the ERIC API URL with query parameters
        const apiUrl = `https://api.ies.ed.gov/eric/?search=${encodeURIComponent(search)}&rows=${rows}`;
        const response = await axios.get(apiUrl);

        // Structure the response with author metadata
        const ericResponse = {
            author: "Eric",
            data: response.data
        };

        res.json(ericResponse);
    } catch (error) {
        console.error('Error fetching data from ERIC API:', error);
        res.status(500).json({ error: 'Error processing Eric AI request' });
    }
});

// Service metadata
const serviceMetadata = {
    name: "Eric AI",
    author: "Eric",
    description: "Fetches educational resources from the ERIC database",
    category: "Search",
    link: ["/api/eric?search=&rows="]
};

export { router, serviceMetadata };
