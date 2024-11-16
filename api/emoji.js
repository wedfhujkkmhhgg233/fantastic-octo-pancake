import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service Metadata
const serviceMetadata = {
    name: "Emoji Mix",
    author: "Jerome",
    description: "Combine two emojis into a custom Emoji Kitchen sticker.",
    category: "Others",
    link: ["/api/emoji-mix?emoji1=&emoji2="] // Relative link to the endpoint
};

// Emoji Mix Route
router.get('/emoji-mix', async (req, res) => {
    // Get query parameters
    const emoji1 = req.query.emoji1 || '🥹'; // Default emoji1
    const emoji2 = req.query.emoji2 || '😗'; // Default emoji2
    const size = req.query.size || 530; // Default size

    // Construct the emoji mix URL
    const emojiMixUrl = `https://emojik.vercel.app/s/${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}?size=${size}`;

    try {
        // Fetch the image data from the generated URL
        const response = await axios.get(emojiMixUrl, { responseType: 'arraybuffer' });

        // Set the response content type to image/png
        res.set('Content-Type', 'image/png');
        // Send the image data directly
        res.send(response.data);
    } catch (error) {
        // Handle errors if fetching the image fails
        res.status(500).json({ message: "Error fetching the emoji mix image." });
    }
});

export { router, serviceMetadata };
