import express from 'express';
import youtubesearchapi from 'youtube-search-api';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: 'YouTube Search',
    author: 'Jerome Jamis',
    description: 'Fetches videos from YouTube based on search keywords.',
    category: 'Search',
    link: ["/api/youtube-search?keywords=&playlist=&limit=&type="]
};

// YouTube Search Route
router.get('/youtube-search', async (req, res) => {
    const { keywords, playlist = 'false', limit = 5, type = 'video' } = req.query;

    if (!keywords) {
        return res.status(400).json({
            success: false,
            message: `
                Missing 'keywords' parameter.
                
                Guide:
                - 'keywords' (required): The search term you want to search on YouTube. Example: ?keywords=cat
                - 'playlist' (optional): Include playlists (true or false). Default: false.
                - 'limit' (optional): The number of results to return. Default: 5.
                - 'type' (optional): Type of content (video, channel, playlist, movie). Default: video.
                
                Full example: /api/youtube-search?keywords=cat&playlist=false&limit=5&type=video
            `
        });
    }

    try {
        const response = await youtubesearchapi.GetListByKeyword(
            keywords,
            playlist === 'true',
            parseInt(limit, 10),
            [{ type }]
        );

        res.type('json').send(JSON.stringify({
            success: true,
            message: "YouTube search results fetched successfully",
            data: response.items
        }, null, 2));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch data from YouTube API",
            error: error.message
        });
    }
});

export { router, serviceMetadata };
