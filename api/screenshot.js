import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service Metadata
const serviceMetadata = {
    name: "Website Screenshot",
    author: "Jerome",
    description: "Capture a website screenshot.",
    category: "Others",
    link: ["/api/screenshot?url="] // Relative link to the endpoint
};

// Screenshot Route
router.get('/screenshot', async (req, res) => {
    const url = req.query.url; // URL to capture

    if (!url) {
        return res.status(400).send({
            status: 400,
            message: "Error: No URL provided. Please include the 'url' query parameter.",
        });
    }

    // Set the options for the RapidAPI request
    const options = {
        method: 'GET',
        url: 'https://sitepic1.p.rapidapi.com/screenshot',
        params: {
            height: '720', // Set the screenshot height
            width: '1280', // Set the screenshot width
            delay: '0', // No delay before capture
            url: url, // Target website URL
        },
        headers: {
            'x-rapidapi-key': 'fb9b4c19c8msh9d206a87805e016p1c3debjsnfc15481f4f3b', // RapidAPI key
            'x-rapidapi-host': 'sitepic1.p.rapidapi.com',
        },
        responseType: 'arraybuffer', // Important for handling binary data (image)
    };

    try {
        // Make the request to the RapidAPI service
        const response = await axios.request(options);

        // Set the response headers and send the image
        res.setHeader('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        res.status(500).send({
            status: 500,
            message: "Error capturing screenshot: " + error.message,
        });
    }
});

export { router, serviceMetadata };
