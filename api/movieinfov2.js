import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: 'MovieInfo - V2',
    author: 'Jerome Jamis',
    description: 'Fetches movie information using V2 of the MovieInfo API.',
    category: 'entertainment',
    link: ["/api/movieinfo/v2?title="]
};

// V2 Route - OMDB API
router.get('/movieinfo/v2', async (req, res) => {
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({
            success: false,
            message: "Please provide a movie title in the 'title' parameter."
        });
    }

    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=fe3acdc5`;

    try {
        const response = await axios.get(url);
        res.type('json').send(JSON.stringify({ success: true, data: response.data }, null, 2));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch data from V2 API",
            error: error.message
        });
    }
});

export { router, serviceMetadata };
