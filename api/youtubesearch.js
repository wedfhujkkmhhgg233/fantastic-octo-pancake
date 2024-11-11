import express from 'express';
import youtubesearchapi from 'ruhend-scraper';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: 'YouTube Search',
    author: 'Jerome Jamis',
    description: 'Fetches YouTube videos and channels based on search keywords.',
    category: 'Search',
    link: ["/api/youtube-search?keywords="]
};

// YouTube Search Route
router.get('/youtube-search', async (req, res) => {
    const { keywords } = req.query;

    if (!keywords) {
        return res.status(400).json({
            success: false,
            message: `
                Missing 'keywords' parameter.
                
                Guide:
                - 'keywords' (required): The search term you want to search on YouTube. Example: ?keywords=cat
                
                Full example: /api/youtube-search?keywords=cat
            `
        });
    }

    try {
        const { video, channel } = await youtubesearchapi.ytsearch(keywords);
        
        // Format the video and channel data
        const formattedData = [...video, ...channel].map((v) => {
            switch (v.type) {
                case 'video':
                    return {
                        type: 'video',
                        title: v.title,
                        url: v.url,
                        duration: v.durationH,
                        uploaded: v.publishedTime,
                        views: v.view
                    };
                case 'channel':
                    return {
                        type: 'channel',
                        channelName: v.channelName,
                        url: v.url,
                        subscribers: v.subscriberH,
                        videoCount: v.videoCount
                    };
                default:
                    return null;
            }
        }).filter(Boolean);

        const responseMessage = JSON.stringify({
            success: true,
            message: "YouTube search results fetched successfully",
            data: formattedData
        }, null, 2);

        res.type('json').send(responseMessage);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch data from YouTube API",
            error: error.message
        });
    }
});

export { router, serviceMetadata };
