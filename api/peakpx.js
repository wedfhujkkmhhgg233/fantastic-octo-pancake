import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

router.get('/peakpx', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({
            error: "Please provide the 'query' query parameter."
        });
    }

    try {
        // Scrape the PeakPX page for wallpapers
        const response = await axios.get(`https://www.peakpx.com/en/search?q=${encodeURIComponent(query)}&device=1`);
        const $ = cheerio.load(response.data);

        const results = [];
        $('ul#list_ul li.grid').each((_, element) => {
            const resolution = $(element).find('.res').text();
            const keywords = $(element).find('meta[itemprop="keywords"]').attr('content');
            const contentUrl = $(element).find('a[itemprop="url"]').attr('href');
            const imageUrl = $(element).find('link[itemprop="contentUrl"]').attr('href');
            const thumbnailUrl = $(element).find('img[itemprop="thumbnail"]').attr('data-src');
            const description = $(element).find('figcaption').text().trim();

            results.push({
                resolution,
                keywords,
                contentUrl,
                imageUrl,
                thumbnailUrl,
                description
            });
        });

        res.status(200).json({
            api_name: "PeakPX - Wallpaper Search",
            description: "An API to search wallpapers on PeakPX based on provided keywords.",
            author: "Jerome",
            query: query,
            results_count: results.length,
            results
        });
    } catch (error) {
        console.error("Error scraping PeakPX:", error);
        res.status(500).json({ error: "An error occurred while fetching wallpapers from PeakPX." });
    }
});

// Route metadata
const serviceMetadata = {
    name: "PeakPX Wallpaper Search",
    author: "Jerome",
    description: "Searches wallpapers on PeakPX by keyword.",
    category: "Search",
    link: ["/api/peakpx?query="]
};

export { router, serviceMetadata };
