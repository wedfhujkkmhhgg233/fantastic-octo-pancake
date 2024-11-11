import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: 'neko',
    author: 'Jerome Jamis',
    description: 'Fetches neko images or gifs (based on type) from the nekos.best API.',
    category: 'Others',
    link: ["/api/neko?type=&amount=<amount>"]  // Simplified the link format
};

// Neko Route
router.get('/neko', async (req, res) => {
    const { type = 'png', amount = 1 } = req.query;

    let url;
    if (type === 'png') {
        url = `https://nekos.best/api/v2/neko?amount=${amount}`;
    } else if (type === 'gif') {
        url = `https://nekos.best/api/v2/hug?amount=${amount}`;
    } else {
        return res.status(400).json({
            success: false,
            message: "Invalid type parameter. Use 'png' or 'gif'."
        });
    }

    try {
        const response = await axios.get(url);
        const formattedResponse = JSON.stringify({
            success: true,
            message: "Neko content fetched successfully",
            data: response.data.results
        }, null, 2);

        res.type('json').send(formattedResponse);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch data from Neko API",
            error: error.message
        });
    }
});

export { router, serviceMetadata };
