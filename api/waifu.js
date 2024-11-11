import express from 'express';
import axios from 'axios';

const router = express.Router();

// Default tags to guide users
const availableTags = [
    "waifu",
    "maid",
    "marin-kitagawa",
    "mori-calliope",
    "raiden-shogun",
    "oppai",
    "selfies",
    "uniform",
    "kamisato-ayaka"
];

// Route metadata
const serviceMetadata = {
    name: 'waifu',
    author: 'Jerome Jamis',
    description: 'Fetches waifu images based on provided tags and filters from Waifu API.',
    category: 'Others',
    link: ["/api/waifu?tags=waifu"]  // Example URL with a default tag
};

// Waifu Route
router.get('/waifu', async (req, res) => {
    let { tags } = req.query;

    // If no tags are provided, return a list of available tags
    if (!tags) {
        return res.status(400).json({
            success: false,
            message: "Please provide tags to filter waifu images.",
            availableTags: availableTags  // Return the available tags for the user to choose from
        });
    }

    try {
        // Fetch the waifu images from the API using the provided tags
        const response = await axios.get(`https://api.waifu.im/search?included_tags=${tags}&height=%3E=2000`);

        // Check if the response contains images
        if (response.data && response.data.images && response.data.images.length > 0) {
            const waifuImage = response.data.images[0].url;  // Get the URL of the first image from the response

            const formattedResponse = JSON.stringify({
                success: true,
                message: `Fetched waifu image with tags "${tags}" successfully.`,
                data: {
                    imageUrl: waifuImage,
                    tags: response.data.images[0].tags.map(tag => tag.name)  // Include tags associated with the image
                }
            }, null, 2);  // Pretty print with 2 spaces indentation

            res.type('json').send(formattedResponse);  // Send the waifu image data as JSON
        } else {
            res.status(404).json({
                success: false,
                message: "No waifu images found with the provided tags.",
                availableTags: availableTags  // Include available tags for further searches
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
