import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

router.get('/yts-movie-search', async (req, res) => {
    const { query, count = 10 } = req.query;

    if (!query) {
        return res.status(400).json({
            error: "Please provide the 'query' query parameter."
        });
    }

    try {
        // Fetch the page for the movie search on YTS
        const response = await axios.get(`https://yts.mx/browse-movies/${encodeURIComponent(query)}`);
        const $ = cheerio.load(response.data);

        const results = [];

        // Iterate through the movie elements on the page
        $('div.browse-movie-wrap').each((index, element) => {
            if (index >= count) return false; // Stop if we've reached the count limit

            const movieTitle = $(element).find('.browse-movie-title').text().trim();
            const movieYear = $(element).find('.browse-movie-year').text().trim();
            const movieRating = $(element).find('.rating').text().trim();
            const movieURL = $(element).find('.browse-movie-link').attr('href');
            const thumbnailURL = $(element).find('img').attr('data-cfsrc');

            results.push({
                title: movieTitle,
                url: `https://yts.mx${movieURL}`,
                year: movieYear,
                rating: movieRating,
                thumbnailURL: thumbnailURL
            });
        });

        // Response with API name, metadata, and search results
        res.status(200).json({
            api_name: "YTS Movie Search",
            description: "An API to search movies on YTS based on provided query.",
            author: "Jerome",
            query: query,
            results_count: results.length,
            results
        });
    } catch (error) {
        console.error("Error scraping YTS:", error);
        res.status(500).json({ error: "An error occurred while fetching movie data from YTS." });
    }
});

// Service metadata
const serviceMetadata = {
    name: "YTS Movie Search",
    author: "Jerome",
    description: "Searches movies on YTS by query term.",
    category: "Search",
    link: ["/api/yts-movie-search?query=<QUERY>&count=<NUMBER>"]
};

export { router, serviceMetadata };
