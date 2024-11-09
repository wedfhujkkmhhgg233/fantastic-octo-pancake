import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/removebgv2', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            error: "Please provide the 'url' query parameter."
        });
    }

    try {
        // Prepare form data
        const formData = `-----011000010111000001101001\r\nContent-Disposition: form-data; name="image_url"\r\n\r\n${url}\r\n-----011000010111000001101001--\r\n`;

        // Send request to RapidAPI background removal service
        const response = await axios.post('https://background-removal.p.rapidapi.com/remove', formData, {
            headers: {
                'x-rapidapi-key': 'fb9b4c19c8msh9d206a87805e016p1c3debjsnfc15481f4f3b',
                'x-rapidapi-host': 'background-removal.p.rapidapi.com',
                'Content-Type': 'multipart/form-data; boundary=---011000010111000001101001'
            }
        });

        // Pretty-print the JSON response
        res.status(200).json(JSON.parse(JSON.stringify(response.data, null, 2)));

    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ error: "An error occurred while processing the image." });
    }
});

// Route metadata
const serviceMetadata = {
    name: "Background Removal v2",
    author: "Jerome",
    description: "Removes background from an image using RapidAPI",
    category: "Image Processing",
    link: ["/api/removebgv2?url="]
};

export { router, serviceMetadata };
