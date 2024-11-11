// Import dependencies
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route to fetch data from Merriam-Webster API for a specific word
router.get('/merriam', async (req, res) => {
    const { word } = req.query;

    // Check if the word query parameter is provided
    if (!word) {
        return res.status(400).json({
            error: "Please add ?word=your_word"
        });
    }

    try {
        // Fetch data from Merriam-Webster API for the specified word
        const apiKey = '1dc97099-a456-4bfa-a73e-db04e5a6fef9';
        const response = await axios.get(`https://www.dictionaryapi.com/api/v3/references/sd4/json/${word}?key=${apiKey}`);
        
        const data = response.data;

        // Check if data was found for the word
        if (!data || data.length === 0) {
            return res.status(404).json({
                error: "No definitions found for the given word"
            });
        }

        // Parse the API response
        const wordDetails = data.map(entry => {
            return {
                word: entry.meta.id,
                partOfSpeech: entry.fl || "N/A",
                definitions: entry.shortdef || [],
                detailedDefinitions: entry.def?.map(def => def.sseq?.flatMap(senseGroup => 
                    senseGroup.flatMap(sense => sense[1]?.dt?.map(defText => defText[1]) || [])
                )) || []
            };
        });

        // Format and send the response
        res.setHeader('Content-Type', 'application/json');
        res.json({
            word,
            results: wordDetails
        });

    } catch (error) {
        console.error("Error fetching data from Merriam-Webster API:", error.message);
        res.status(500).json({
            error: "Failed to retrieve word information from Merriam-Webster"
        });
    }
});

// Metadata for the Merriam-Webster Scraper service
const serviceMetadata = {
    name: "Merriam-Webster Scraper",
    author: "Jerome",
    description: "Fetch word details, definitions, and parts of speech from Merriam-Webster API",
    category: "Search",
    link: ["/api/merriam?word=example"]
};

export { router, serviceMetadata };
