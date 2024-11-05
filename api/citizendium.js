// Import dependencies
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

// Route to scrape Citizendium for a specific word
router.get('/citizendium', async (req, res) => {
    const { word } = req.query;

    // Check if the word query parameter is provided
    if (!word) {
        return res.status(400).json({
            error: "Please add ?word=your_word"
        });
    }

    try {
        // Fetch the Citizendium page HTML for the specified word
        const response = await axios.get(`https://citizendium.org/wiki/${word}`);
        const html = response.data;
        const $ = cheerio.load(html);

        // Extract content from the page
        const content = [];
        $('p').each((_, element) => {
            const text = $(element).text().trim().replace(/\n+/g, '\n').trim();
            if (text) content.push(text);
        });

        // Construct the response object
        const wordData = {
            title: word.charAt(0).toUpperCase() + word.slice(1),
            description: content.join('\n\n'), // Joining paragraphs for a complete description
            source: `Retrieved from https://citizendium.org/wiki/${word}`,
        };

        // Send the scraped data as JSON
        res.setHeader('Content-Type', 'application/json');
        res.json(wordData);

    } catch (error) {
        console.error("Error scraping Citizendium:", error.message);
        res.status(500).json({
            error: "Failed to retrieve information from Citizendium"
        });
    }
});

// Metadata for the Citizendium Scraper service
const serviceMetadata = {
    name: "Citizendium Scraper",
    author: "Jerome",
    description: "Scrape information from Citizendium based on a specified word",
    category: "encyclopedia",
    link: ["/api/citizendium?word=cat"]
};

export { router, serviceMetadata };
