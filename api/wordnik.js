// Import dependencies
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

// Route to scrape Wordnik for a specific word
router.get('/wordnik', async (req, res) => {
    const { word } = req.query;

    // Check if the word query parameter is provided
    if (!word) {
        return res.status(400).json({
            error: "Please add ?word=your_word"
        });
    }

    try {
        // Fetch the Wordnik page HTML for the specified word
        const response = await axios.get(`https://www.wordnik.com/words/${word}`);
        const html = response.data;
        const $ = cheerio.load(html);

        // Scrape definitions with part of speech
        const definitions = [];
        $('.definitions .definition').each((_, element) => {
            const definition = $(element).find('.word__defination--2q7ZH').text().trim();
            const partOfSpeech = $(element).find('.pos').text().trim();

            if (definition) {
                definitions.push({
                    definition,
                    partOfSpeech: partOfSpeech || 'Unknown'  // Default to 'Unknown' if no part of speech is found
                });
            }
        });

        // Scrape examples
        const examples = [];
        $('.examples .example').each((_, element) => {
            const example = $(element).text().trim();
            if (example) examples.push(example);
        });

        // Scrape word origin if available
        const wordOrigin = $('.etymology').text().trim() || null;

        // Create a structured response object
        const wordData = {
            word,
            definitions,
            examples,
            origin: wordOrigin
        };

        // Send the scraped data as JSON
        res.setHeader('Content-Type', 'application/json');
        res.json(wordData);

    } catch (error) {
        console.error("Error scraping Wordnik:", error.message);
        res.status(500).json({
            error: "Failed to retrieve word information from Wordnik"
        });
    }
});

// Metadata for the Wordnik Scraper service
const serviceMetadata = {
    name: "Wordnik Scraper",
    author: "Jerome",
    description: "Scrape word details, definitions, examples, and part of speech from Wordnik",
    category: "dictionary",
    link: ["/api/wordnik?word=example"]
};

export { router, serviceMetadata };
