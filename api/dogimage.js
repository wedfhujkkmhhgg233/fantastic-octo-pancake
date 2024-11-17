import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service Metadata
const serviceMetadata = {
    name: "Random Dog Image",
    author: "Jerome",
    description: "Fetch a random dog image from Dog CEO API.",
    category: "Others",
    link: ["/api/random-dog"] // Relative link to the endpoint
};

// Random Dog Image Route
router.get('/random-dog', async (req, res) => {
    try {
        // Fetch a single random dog image from Dog CEO API
        const response = await axios.get('https://dog.ceo/api/breeds/image/random');

        // Decode the URL and ensure it is properly formatted
        const decodedUrl = decodeURIComponent(response.data.message);

        // Prepare the prettified JSON response
        const prettyResponse = JSON.stringify(
            {
                status: 200,
                message: "Random Dog Image Fetched Successfully",
                url: decodedUrl,
            },
            null,
            2 // Prettify the JSON with 2 spaces
        );

        // Send the prettified JSON response as a string
        res.setHeader('Content-Type', 'application/json');
        res.send(prettyResponse);
    } catch (error) {
        // Handle errors and send a prettified error response
        const errorResponse = JSON.stringify(
            {
                status: 500,
                message: "Error fetching random dog image: " + error.message,
            },
            null,
            2 // Prettify the JSON with 2 spaces
        );

        res.setHeader('Content-Type', 'application/json');
        res.send(errorResponse);
    }
});

export { router, serviceMetadata };
