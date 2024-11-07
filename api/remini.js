import express from 'express';
import Remini from 'betabotz-tools';

const router = express.Router();

router.get('/remini', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            error: "Please provide an image URL with the 'url' query parameter."
        });
    }

    try {
        // Use Remini to process the image
        const results = await Remini(url);

        // Send back the results in a pretty-printed JSON format
        res.status(200).json({
            author: "Jerome",
            processed_image: results
        });

    } catch (error) {
        console.error("Error processing image with Remini:", error);
        res.status(500).json({ error: "An error occurred while processing the image." });
    }
});

// Route metadata
const serviceMetadata = {
    name: "Image Enhancement",
    author: "Jerome",
    description: "Enhances images using Remini",
    category: "Tools",
    link: ["/remini?url=<IMAGE_URL>"]
};

export { router, serviceMetadata };
