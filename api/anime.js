import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Define __dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Route metadata
const serviceMetadata = {
    name: "anime-quotes",
    author: "Jerome Jamis",
    description: "Fetches a random anime quote from a data file.",
    category: "Anime Quotes",
    link: ["/api/anime-quotes"],
};

// Route to fetch a random anime quote
router.get('/anime-quotes', async (req, res) => {
    const dataFilePath = path.join(__dirname, 'data.json');

    try {
        // Load and parse the JSON data
        const data = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));

        // Select a random quote from the data
        const randomQuote = data[Math.floor(Math.random() * data.length)];

        res.json({
            success: true,
            message: "Random quote fetched successfully.",
            data: randomQuote
        });
    } catch (error) {
        console.error("Error fetching quote:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching the quote.",
            error: error.message
        });
    }
});

// Export the router and service metadata
export { router, serviceMetadata };
