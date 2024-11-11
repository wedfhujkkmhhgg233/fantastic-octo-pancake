import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: 'movie-whoa',
    author: 'Jerome Jamis',
    description: 'Fetches random "whoa" quotes from movies.',
    category: 'Others',
    link: ["/api/movie-whoa/random"]
};

// Movie Whoa Route
router.get('/movie-whoa/random', async (req, res) => {
    try {
        const response = await axios.get('https://whoa.onrender.com/whoas/random');
        
        const formattedResponse = JSON.stringify({
            success: true,
            message: "Fetched random 'whoa' movie quote successfully.",
            data: response.data
        }, null, 2);

        res.type('json').send(formattedResponse);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch data from Movie 'Whoa' API",
            error: error.message
        });
    }
});

export { router, serviceMetadata };
