import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: 'MovieInfo - V1',
    author: 'Jerome Jamis',
    description: 'Fetches movie information using V1 of the MovieInfo.',
    category: 'Search',
    link: ["/api/movieinfo/v1?title=&lang=&max_results="]
};

// V1 Route - RapidAPI Movie Info API
router.get('/movieinfo/v1', async (req, res) => {
    const { title, lang = 'en-US', max_results = '10' } = req.query;

    if (!title) {
        return res.status(400).json({
            success: false,
            message: "Please provide a movie title in the 'title' parameter."
        });
    }

    const options = {
        method: 'GET',
        url: 'https://movie-info-api.p.rapidapi.com/movie-info',
        params: { title, lang, max_results },
        headers: {
            'x-rapidapi-key': 'fb9b4c19c8msh9d206a87805e016p1c3debjsnfc15481f4f3b',
            'x-rapidapi-host': 'movie-info-api.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        res.type('json').send(JSON.stringify({ success: true, data: response.data }, null, 2));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch data from V1 API",
            error: error.message
        });
    }
});

export { router, serviceMetadata };
