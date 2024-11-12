import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: 'prodia v2',
    author: 'Jerome Jamis',
    description: 'Generates an image using the Prodia API based on a given prompt.',
    category: 'Image Generation',
    link: ["/api/prodia-image?prompt="]
};

// Prodia Image Generation Route
router.get('/prodia-image', async (req, res) => {
    const prompt = req.query.prompt;

    if (!prompt) {
        return res.status(400).json({
            success: false,
            message: "Please provide a prompt for image generation."
        });
    }

    try {
        // Initial request to start the image generation
        const result = await axios.post(
            'https://nexra.aryahcr.cc/api/image/complements',
            {
                prompt: prompt,
                model: "prodia",
                data: {
                    model: "absolutereality_V16.safetensors [37db0fc3]",
                    steps: 25,
                    cfg_scale: 7,
                    sampler: "DPM++ 2M Karras",
                    negative_prompt: ""
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        let id = result.data.id;
        console.log(`Image generation started with ID: ${id}`);

        // Polling for the image generation status
        let isPending = true;
        let response = null;

        while (isPending) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second between requests

            response = await axios.get(`https://nexra.aryahcr.cc/api/image/complements/${encodeURIComponent(id)}`);
            response = response.data;

            switch (response.status) {
                case "pending":
                    isPending = true;
                    break;
                case "completed":
                    isPending = false;
                    return res.type('json').send(JSON.stringify({
                        success: true,
                        message: "Image generation completed successfully.",
                        data: response
                    }, null, 2));  // Pretty-printing the JSON response with 2-space indentation
                case "error":
                case "not_found":
                    isPending = false;
                    return res.type('json').send(JSON.stringify({
                        success: false,
                        message: `Image generation failed with status: ${response.status}.`,
                        error: response.error || "Unknown error"
                    }, null, 2));
            }
        }
    } catch (error) {
        console.error('Error during image generation:', error.message);
        res.type('json').send(JSON.stringify({
            success: false,
            message: "An error occurred while processing your request.",
            error: error.message
        }, null, 2));
    }
});

export { router, serviceMetadata };
