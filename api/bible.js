import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service Metadata
const serviceMetadata = {
    name: "Random Bible Verse",
    author: "Jerome",
    description: "Fetch a random Bible verse.",
    category: "Others",
    link: ["/api/random-bible-verse"] // Relative link to the endpoint
};

// Random Bible Verse Route
router.get('/random-bible-verse', async (req, res) => {
    try {
        // Fetch a random Bible verse from the API
        const response = await axios.get('https://bible-api.com/?random=verse');

        // Prettify the response JSON
        const prettyResponse = JSON.stringify(response.data, null, 2);

        // Send the prettified JSON as the response
        res.setHeader('Content-Type', 'application/json');
        res.send(prettyResponse);
    } catch (error) {
        // Handle errors and send an appropriate response
        res.status(500).send({
            status: 500,
            message: "Error fetching random Bible verse: " + error.message,
        });
    }
});

export { router, serviceMetadata };
