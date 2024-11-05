import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

const router = express.Router();

// Route to scrape Wordnik for a specific word
router.get('/wordnik', async (req, res) => {
    const { word } = req.query;

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

        // Scrape definitions
        const definitions = [];
        $('.word-module .definition').each((_, element) => {
            definitions.push($(element).text().trim());
        });

        // Scrape example sentences
        const examples = [];
        $('.examples .example').each((_, element) => {
            examples.push($(element).find('.text').text().trim());
        });

        // Scrape related words (e.g., synonyms, antonyms)
        const relatedWords = [];
        $('.related-word').each((_, element) => {
            relatedWords.push($(element).text().trim());
        });

        // Create a structured response object
        const wordData = {
            word: word,
            definitions: definitions,
            examples: examples,
            relatedWords: relatedWords
        };

        // Send the scraped data as JSON
        res.setHeader('Content-Type', 'application/json');
        res.json(wordData);

    } catch (error) {
        console.error("Error scraping Wordnik:", error);
        res.status(500).json({
            error: "Failed to retrieve word information from Wordnik"
        });
    }
});

const serviceMetadata = {
    name: "Wordnik",
    author: "Jerome",
    description: "Find word details from Wordnik",
    category: "dictionary",
    link: ["/api/wordnik?word=dog"]
};

export { router, serviceMetadata };
