import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/prodia', async (req, res) => {
    const { prompt } = req.query;

    if (!prompt) {
        return res.status(400).json({
            error: "Please provide the 'prompt' query parameter."
        });
    }

    try {
        // Make a request to the Prodia API with the provided prompt
        const prodiaResponse = await axios.get(`https://hercai.onrender.com/prodia/text2image`, {
            params: { prompt: prompt }
        });

        const data = prodiaResponse.data;

        // Check if the API response contains a URL
        if (data.url) {
            // Respond with the URL and author in pretty print format
            res.status(200).json({
                model: "prodia",
                prompt: prompt,
                url: data.url,
                author: "Jerome"
            });
        } else {
            res.status(500).json({ error: 'Failed to generate image from Prodia API.' });
        }
    } catch (error) {
        console.error("Error in Prodia API:", error);
        res.status(500).json({ error: "An error occurred while processing the image." });
    }
});

// Route metadata
const serviceMetadata = {
    name: "Prodia Image Generation",
    author: "Jerome",
    description: "Generates images using the Prodia API based on text prompts.",
    category: "AI Image Generation",
    link: ["/api/prodia?prompt="]
};

export { router, serviceMetadata };
