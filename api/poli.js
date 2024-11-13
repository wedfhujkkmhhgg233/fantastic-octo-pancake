import express from 'express';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Define __dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Route metadata
const serviceMetadata = {
    name: "genmage",
    author: "Jerome Jamis",
    description: "Generate AI images based on a text prompt.",
    category: "AI Image Generation",
    link: ["/api/genmage?text=dog"],
};

// Image Generation Route
router.get('/genmage', async (req, res) => {
    const query = req.query.text;
    if (!query) {
        return res.status(400).json({
            success: false,
            message: "Please provide a text prompt using the 'text' query parameter."
        });
    }

    try {
        // Generate the image from Pollinations API
        const imageResponse = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`, {
            responseType: "arraybuffer",
        });

        // Save the image temporarily
        const imagePath = path.join(__dirname, 'cache', 'poli.png');
        fs.ensureDirSync(path.dirname(imagePath));
        fs.writeFileSync(imagePath, imageResponse.data);

        // Send the image as a response
        res.sendFile(imagePath, () => {
            // Clean up the temporary file after sending
            fs.unlinkSync(imagePath);
        });
    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while generating the image.",
            error: error.message
        });
    }
});

// Export the router and service metadata
export { router, serviceMetadata };
