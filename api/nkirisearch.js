import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

router.get('/nkiri-search', async (req, res) => {
    const { query, count = 10 } = req.query;

    if (!query) {
        return res.status(400).json({
            error: "Please provide the 'query' query parameter."
        });
    }

    try {
        // Scraping the Nkiri search page for movies and TV series
        const response = await axios.get(`https://nkiri.com/?s=${encodeURIComponent(query)}`);
        const $ = cheerio.load(response.data);

        const results = [];

        // Iterate through the articles on the search page
        $('article').each((index, element) => {
            if (index >= count) return false; // Stop if we've reached the count limit

            const title = $(element).find('.search-entry-title a').text().trim();
            const url = $(element).find('.search-entry-title a').attr('href');
            const thumbnail = $(element).find('.thumbnail img').attr('src');

            // Only add the item if the essential info is available
            if (title && url && thumbnail) {
                results.push({
                    title: title,
                    thumbnail: thumbnail,
                    url: url
                });
            }
        });

        // Return the response with API info and the scraped results
        res.status(200).json({
            api_information: {
                api_name: "Nkiri",
                description: "Nkiri to search movies & tv series.",
                author: "Jerome"
            },
            results
        });
    } catch (error) {
        console.error("Error scraping Nkiri:", error);
        res.status(500).json({ error: "An error occurred while fetching data from Nkiri." });
    }
});

// Service metadata
const serviceMetadata = {
    name: "Nkiri Movie & TV Series Search",
    author: "Jerome",
    description: "Searches for movies and TV series on Nkiri by query term.",
    category: "Search",
    link: ["/api/nkiri-search?query=Spiderman&count=10"]
};

export { router, serviceMetadata };
