import express from 'express';
import imagine from '@shuddho11288/sdxl-imagine'; // Import without curly braces

const router = express.Router();

router.get('/sdxl', async (req, res) => {
    const { prompt } = req.query;

    if (!prompt) {
        return res.status(400).json({
            error: "Please provide the 'prompt' query parameter."
        });
    }

    try {
        // Call the imagine function with the provided prompt
        const data = await imagine(prompt);

        // Directly return the response from the 'imagine' function without modifications
        res.status(200).json(data);

    } catch (error) {
        console.error("Error generating image with SDXL:", error);
        res.status(500).json({ error: "An error occurred while generating the image." });
    }
});

// Route metadata
const serviceMetadata = {
    name: "SDXL Image Generation",
    author: "Jerome",
    description: "Generates images based on text prompts using SDXL API.",
    category: "Image Generation",
    link: ["/api/sdxl?prompt="]
};

export { router, serviceMetadata };
