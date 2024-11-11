import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: 'random-meme',
    author: 'Jerome Jamis',
    description: 'Fetches a random meme from the meme generator API.',
    category: 'Others',
    link: ["/api/random-meme"]
};

// Random Meme Route
router.get('/random-meme', async (req, res) => {
    try {
        const response = await axios.get('https://api.imgflip.com/get_memes');
        
        // Select a random meme from the response
        const randomMeme = response.data.data.memes[Math.floor(Math.random() * response.data.data.memes.length)];

        const formattedResponse = JSON.stringify({
            success: true,
            message: "Fetched a random meme successfully.",
            data: randomMeme
        }, null, 2);

        res.type('json').send(formattedResponse);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch random meme from meme API",
            error: error.message
        });
    }
});

export { router, serviceMetadata };
