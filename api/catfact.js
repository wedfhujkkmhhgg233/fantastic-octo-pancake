import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service Metadata
const serviceMetadata = {
    name: "Random Cat Fact",
    author: "Jerome",
    description: "Fetch a random cat fact.",
    category: "Others",
    link: ["/apirandom-cat-fact"] // Relative link to the endpoint
};

// Random Cat Fact Route
router.get('/random-cat-fact', async (req, res) => {
    try {
        // Fetch a random cat fact from CatFact API
        const response = await axios.get('https://catfact.ninja/fact');
        
        // Prepare the prettified JSON response
        const prettyResponse = JSON.stringify(
            {
                status: 200,
                message: "Random Cat Fact Fetched Successfully",
                fact: response.data.fact,
            },
            null,
            2 // Prettify the JSON with 2 spaces
        );

        // Send the prettified JSON response
        res.setHeader('Content-Type', 'application/json');
        res.send(prettyResponse);
    } catch (error) {
        // Handle errors and send a prettified error response
        const errorResponse = JSON.stringify(
            {
                status: 500,
                message: "Error fetching random cat fact: " + error.message,
            },
            null,
            2 // Prettify the JSON with 2 spaces
        );

        res.setHeader('Content-Type', 'application/json');
        res.send(errorResponse);
    }
});

export { router, serviceMetadata };
