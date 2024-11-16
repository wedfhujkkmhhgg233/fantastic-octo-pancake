import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service Metadata
const serviceMetadata = {
    name: "Random Cat Image",
    author: "Jerome",
    description: "Fetch a random cat image.",
    category: "Fun",
    link: ["/api/random-cat"] // Relative link to the endpoint
};

// Random Cat Image Route
router.get('/random-cat', async (req, res) => {
    try {
        // Fetch a single random cat image from The Cat API
        const response = await axios.get('https://api.thecatapi.com/v1/images/search?limit=1', {
            headers: {
                'x-api-key': 'live_2ONykfLGqtHkXPY7t9SNBCKw02lQHZZGlvvIL5V4ocKB9cT34omKcjKT0P8LOlay',
            },
        });

        // Extract the image URL from the API response
        const imageUrl = response.data[0].url;

        // Prepare the response object
        const prettyResponse = {
            status: 200,
            message: "Random Cat Image Fetched Successfully",
            url: imageUrl,
        };

        // Respond with the stringified, prettified JSON
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(prettyResponse, null, 2)); // Pretty format
    } catch (error) {
        // Handle errors and send a prettified error response
        const errorResponse = {
            status: 500,
            message: "Error fetching random cat image: " + error.message,
        };

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(errorResponse, null, 2)); // Pretty format
    }
});

export { router, serviceMetadata };
