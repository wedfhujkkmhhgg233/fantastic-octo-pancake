import express from 'express';
import axios from 'axios';  // Import axios
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; // Required to get __dirname in ES modules

const router = express.Router();

// Use fileURLToPath to get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/prodia', async (req, res) => {
    const { prompt } = req.query;

    if (!prompt) {
        return res.status(400).json({
            error: "Please provide the 'prompt' query parameter."
        });
    }

    try {
        // Make a request to the Prodia API
        const prodiaResponse = await axios.get(`https://hercai.onrender.com/prodia/text2image`, {
            params: { prompt: prompt }
        });

        const data = prodiaResponse.data;

        if (data.url) {
            const imageUrl = data.url;

            // Fetch the image using axios
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(imageResponse.data);

            // Save the image to a file in the 'jerprodia' folder
            const folderPath = path.join(__dirname, 'jerprodia');
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            const imagePath = path.join(folderPath, 'prodia.png');
            fs.writeFileSync(imagePath, imageBuffer);

            // Respond with the file URL
            res.status(200).json({
                model: "prodia",
                prompt: prompt,
                url: `https://jerome-web.onrender.com/jerprodia/prodia.png`
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
    category: "Image Generation",
    link: ["/prodia?prompt=<TEXT_PROMPT>"]
};

export { router, serviceMetadata };
