import express from 'express';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up static file serving for the 'jerprodia' folder
const folderPath = path.join(__dirname, 'jerprodia');
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
}
router.use('/jerprodia', express.static(folderPath));

router.get('/prodia', async (req, res) => {
    const { prompt } = req.query;

    if (!prompt) {
        return res.status(400).json({
            error: "Please provide the 'prompt' query parameter."
        });
    }

    try {
        const prodiaResponse = await axios.get(`https://hercai.onrender.com/prodia/text2image`, {
            params: { prompt }
        });

        const data = prodiaResponse.data;

        if (data.url) {
            const imageUrl = data.url;

            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(imageResponse.data);

            const imagePath = path.join(folderPath, 'prodia.png');
            fs.writeFileSync(imagePath, imageBuffer);

            res.status(200).json({
                model: "prodia",
                prompt,
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
    author: "Jerome Jamis",
    description: "Generates images using the Prodia API based on text prompts.",
    category: "Image Generation",
    link: ["/api/prodia?prompt="]
};

export { router, serviceMetadata };
