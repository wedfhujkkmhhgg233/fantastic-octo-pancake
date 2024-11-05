import express from 'express';
import UltimateGuitar from 'ultimate-guitar';

const router = express.Router();

// Route to fetch chords for a given song title
router.get('/chords', async (req, res) => {
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ error: 'Song title is required' });
    }

    try {
        const guitar = new UltimateGuitar();
        await guitar.init(title); // Initialize with the song title
        const data = await guitar.fetch_data(UltimateGuitar.FIRST); // Fetch chords

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'No chords found for this song' });
        }

        res.json({
            success: true,
            title: title,
            chords: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching chords: ' + error.message });
    }
});

// Service metadata
const serviceMetadata = {
    name: "Chords Fetcher",
    author: "Jerome",
    description: "Fetches guitar chords for a given song title",
    category: "Music",
    link: ["/api/chords?title="]
};

export { router, serviceMetadata }; // Use export instead of module.exports
