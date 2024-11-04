const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/bing', async (req, res) => {
    const prompt = req.query.prompt;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // Make a request to the external API
        const response = await axios.get(`http://nova.hidencloud.com:25710/api/search?prompt=${encodeURIComponent(prompt)}`);
        
        // Modify the response to change the author
        const data = response.data;
        data.author = "Jerome";

        // Send the modified response
        res.json({
            success: data.success,
            author: data.author,
            result: data.result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching data from the external API.' });
    }
});

const serviceMetadata = {
    name: "Imagine",
    author: "Jerome",
    description: "Image generator",
    category: "Image",
    link: ["/api/bing?prompt="]
};

module.exports = { router, serviceMetadata };
