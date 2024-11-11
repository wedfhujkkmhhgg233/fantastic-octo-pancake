import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: 'MovieInfo - V3',
    author: 'Jerome Jamis',
    description: 'Fetches movie information using V3 of the MovieInfo API.',
    category: 'Search',
    link: ["/api/movieinfo/v3?title="]
};

// V3 Route - The Movie Database API
router.get('/movieinfo/v3', async (req, res) => {
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({
            success: false,
            message: "Please provide a movie title in the 'title' parameter."
        });
    }

    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&api_key=89f7979949ecc794b3887f505e119af4`;

    try {
        const response = await axios.get(url);
        res.type('json').send(JSON.stringify({ success: true, data: response.data.results }, null, 2));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch data from V3 API",
            error: error.message
        });
    }
});

export { router, serviceMetadata };
