import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: 'waifu',
    author: 'Jerome Jamis',
    description: 'Fetches waifu images based on provided tags and filters from Waifu API.',
    category: 'Others',
    link: ["/api/waifu?tags=waifu"]
};

// Waifu Route
router.get('/waifu', async (req, res) => {
    const { tags } = req.query;

    if (!tags) {
        return res.status(400).json({
            success: false,
            message: "Please provide tags to filter waifu images."
        });
    }

    try {
        const response = await axios.get(`https://api.waifu.im/search?included_tags=${tags}&height=%3E=2000`);

        // Check if the response contains data
        if (response.data && response.data.results && response.data.results.length > 0) {
            const waifuImage = response.data.results[0].url;  // Get the URL of the first image from the response

            const formattedResponse = JSON.stringify({
                success: true,
                message: `Fetched waifu image with tags "${tags}" successfully.`,
                data: {
                    imageUrl: waifuImage
                }
            }, null, 2);  // Pretty print with 2 spaces indentation

            res.type('json').send(formattedResponse);  // Send the waifu image data as JSON
        } else {
            res.status(404).json({
                success: false,
                message: "No waifu images found with the provided tags."
            });
        }
    } catch (error) {
        const errorResponse = JSON.stringify({
            success: false,
            message: "Failed to fetch waifu image.",
            error: error.message
        }, null, 2);  // Pretty print the error response

        res.status(500).json(errorResponse);  // Send error response as JSON
    }
});

export { router, serviceMetadata };
