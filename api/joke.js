import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: 'Random Joke',
    author: 'Jerome Jamis',
    description: 'Fetches random jokes from the JokeAPI.',
    category: 'Others',
    link: ["/api/random-joke"]
};

// Random Joke Route
router.get('/random-joke', async (req, res) => {
    try {
        // Make API request to JokeAPI
        const response = await axios.get('https://v2.jokeapi.dev/joke/Any');

        // Check if the response is valid
        if (response.data && response.data.error === false) {
            const jokeData = response.data;

            const formattedResponse = JSON.stringify({
                success: true,
                message: "Random joke fetched successfully",
                category: jokeData.category,
                type: jokeData.type,
                flags: jokeData.flags,
                joke: jokeData.type === 'twopart' ? {
                    setup: jokeData.setup,
                    delivery: jokeData.delivery
                } : {
                    joke: jokeData.joke
                }
            }, null, 2);

            res.type('json').send(formattedResponse);
        } else {
            res.status(404).json({
                success: false,
                message: "No joke found. Please try again later."
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch data from JokeAPI",
            error: error.message
        });
    }
});

export { router, serviceMetadata };
