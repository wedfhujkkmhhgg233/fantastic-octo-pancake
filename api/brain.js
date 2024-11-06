import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/brain-ai', async (req, res) => {
    const { message } = req.query;

    if (!message) {
        return res.status(400).json({ error: 'Message parameter is required' });
    }

    try {
        const apiUrl = `https://popcat.xyz/chatbot?message=${encodeURIComponent(message)}`;
        const response = await axios.get(apiUrl);

        // Extracts only the chatbot message and formats it with author
        const brainResponse = {
            author: "Jerome",
            message: response.data
        };

        res.json(brainResponse);
    } catch (error) {
        console.error('Error fetching data from Popcat API:', error);
        res.status(500).json({ error: 'Error processing Brain AI request' });
    }
});

// Service metadata
const serviceMetadata = {
    name: "Brain AI",
    author: "Jerome",
    description: "Interactive AI chatbot using Popcat API",
    category: "Chat",
    link: ["/api/brain-ai?message="]
};

export { router, serviceMetadata };
