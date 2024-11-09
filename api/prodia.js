import express from 'express';
import axios from 'axios';
import fs from 'fs';
import https from 'https';
import path from 'path';

const router = express.Router();

// Create folder if it doesn't exist
const folderPath = path.join(__dirname, 'jerprodia');
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath);
}

router.get('/prodia', async (req, res) => {
    const { prompt } = req.query;

    if (!prompt) {
        return res.status(400).json({
            error: "Please provide the 'prompt' query parameter."
        });
    }

    try {
        // Step 1: Get the URL from the Prodia API
        const apiUrl = `https://hercai.onrender.com/prodia/text2image?prompt=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        const imageUrl = response.data.url;

        if (!imageUrl) {
            return res.status(500).json({ error: "No image URL found in the response." });
        }

        // Step 2: Download the image
        const filePath = path.join(folderPath, 'prodia.png');

        const file = fs.createWriteStream(filePath);
        https.get(imageUrl, (imageResponse) => {
            imageResponse.pipe(file);
            file.on('finish', () => {
                file.close();  // Close the file stream

                // Step 3: Send the response in a pretty print format
                res.status(200).json({
                    "model": "prodia",
                    "prompt": prompt,
                    "url": `https://jerome-web.onrender.com/jerprodia/prodia.png`
                });
            });
        }).on('error', (error) => {
            console.error("Error downloading the image:", error);
            res.status(500).json({ error: "An error occurred while downloading the image." });
        });

    } catch (error) {
        console.error("Error generating image with Prodia:", error);
        res.status(500).json({ error: "An error occurred while generating the image." });
    }
});

// Route metadata
const serviceMetadata = {
    name: "Prodia Image Generation",
    author: "Jerome",
    description: "Generates images based on text prompts using Prodia API and provides the image URL.",
    category: "Image Generation",
    link: ["/api/prodia?prompt="]
};

export { router, serviceMetadata };
