import express from 'express';
import axios from 'axios';

const router = express.Router();

// Endpoint to get a random user
router.get('/random-user', async (req, res) => {
    try {
        // Fetch random user data from the API
        const response = await axios.get('https://randomuser.me/api/');

        // Extract important information: gender and name
        const user = response.data.results[0];  // Get the first user in the response
        const importantInfo = {
            gender: user.gender,
            name: `${user.name.first} ${user.name.last}`, // Combine first and last name
        };

        // Send the important information as a pretty-stringified response
        return res.status(200).json(JSON.parse(JSON.stringify(importantInfo, null, 2)));
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching random user data' });
    }
});

// Service Metadata
const serviceMetadata = {
    name: 'Random User API',
    author: 'Jerome',
    description: 'Fetches a random user with gender and name from RandomUser.me API.',
    category: 'Others',
    link: ["/api/random-user"] // Relative link to the endpoint
};

// Export the router and metadata
export { router, serviceMetadata };
