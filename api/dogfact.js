import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Service Metadata
const serviceMetadata = {
    name: "Random Dog Fact",
    author: "Jerome",  // Added author tag
    description: "Fetch a random dog fact from a local dog facts file.",
    category: "Others",
    link: "/api/random-dog-fact", // Relative link to the endpoint
};

// Random Dog Fact Route
router.get('/random-dog-fact', async (req, res) => {
    try {
        // Read the dog.json file (Make sure the dog.json file is in the same directory as this file or update the path)
        const dogFacts = JSON.parse(fs.readFileSync(path.resolve('dog.json'), 'utf8'));

        // Select a random fact from the array
        const randomFact = dogFacts[Math.floor(Math.random() * dogFacts.length)];

        // Prepare the prettified JSON response
        const prettyResponse = JSON.stringify(
            {
                status: 200,
                message: "Random Dog Fact Fetched Successfully",
                author: serviceMetadata.author,  // Adding author tag to the response
                fact: randomFact.fact,
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
                message: "Error fetching random dog fact: " + error.message,
                author: serviceMetadata.author,  // Adding author tag to the error response
            },
            null,
            2 // Prettify the JSON with 2 spaces
        );

        res.setHeader('Content-Type', 'application/json');
        res.send(errorResponse);
    }
});

export { router, serviceMetadata };
