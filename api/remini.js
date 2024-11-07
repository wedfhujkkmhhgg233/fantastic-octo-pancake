import express from 'express';
import nayanServer from 'nayan-server'; // Import without destructuring

const router = express.Router();

router.get('/remini', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            error: "Please provide the 'url' query parameter."
        });
    }

    try {
        const model = "1"; // Set the model to 1 by default

        // Use Nayan Server's upscale function
        const data = await nayanServer.upscale(url, model);

        // Return the result in a structured format
        res.status(200).json({
            author: "Jerome",
            enhanced_image: data // Assuming data contains the processed image URL or base64 string
        });

    } catch (error) {
        console.error("Error processing image with Nayan:", error);
        res.status(500).json({ error: "An error occurred while processing the image." });
    }
});

// Route metadata
const serviceMetadata = {
    name: "Image Enhancement",
    author: "Jerome",
    description: "Enhances images",
    category: "Image Processing",
    link: ["/api/remini?url=<IMAGE_URL>"]
};

export { router, serviceMetadata };
