import express from 'express';
import Upscaler from 'upscaler';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const upscaler = new Upscaler();

router.get('/remini', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            error: "Please provide an image URL with the 'url' query parameter."
        });
    }

    try {
        // Fetch the image from the URL
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imagePath = path.join(__dirname, 'temp-image.jpg');

        // Save the image temporarily
        fs.writeFileSync(imagePath, response.data);

        // Upscale the image
        const upscaledImage = await upscaler.upscale(imagePath);

        // Clean up the temporary image file
        fs.unlinkSync(imagePath);

        // Send back the enhanced image as base64 in a structured response
        res.status(200).json({
            author: "Jerome",
            enhanced_image: upscaledImage
        });

    } catch (error) {
        console.error("Error processing image with Upscaler:", error);
        res.status(500).json({ error: "An error occurred while processing the image." });
    }
});

// Route metadata
const serviceMetadata = {
    name: "Image Enhancement",
    author: "Jerome",
    description: "Enhances images using the Upscaler library",
    category: "Image Processing",
    link: ["/remini?url=<IMAGE_URL>"]
};

export { router, serviceMetadata };
