import express from 'express';
import Parser from 'rss-parser'; // If you're using ES Modules
// const Parser = require('rss-parser'); // For CommonJS

const router = express.Router();
const parser = new Parser();

// Service Metadata
const serviceMetadata = {
  name: 'News Finder',
  author: 'Jerome Jamis',
  description: 'Fetches Google News articles based on a query.',
  category: 'Search',
  link: ['/api/news?query=&count='],
};

// Fetch Google News RSS with count
async function getGoogleNews(query, count = 10) {
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
    
    try {
        // Fetch and parse the RSS feed
        const feed = await parser.parseURL(url);
        
        // Map the feed items to a more structured format (as JSON)
        // Limit the number of articles based on the 'count' parameter
        const articles = feed.items.slice(0, count).map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            description: item.contentSnippet,
            source: item.source,
        }));

        return articles; // Return the structured data for other processing
    } catch (err) {
        console.error('Error fetching Google News RSS feed:', err);

        return {
            status: 'error',
            message: 'Failed to fetch Google News RSS feed',
            error: err.message,
        };
    }
}

// Express route to get Google News based on query and count
router.get('/news', async (req, res) => {
    const { query, count = 10 } = req.query; // Default count to 10 if not provided

    if (!query) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing query parameter. Provide a topic or keyword to search for news.',
            guide: {
                usage: '/news?query=<search-term>&count=<number>',
                example: '/news?query=technology&count=5',
            },
        });
    }

    try {
        const articles = await getGoogleNews(query, count);
        // Send the articles as a pretty JSON response
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch Google News articles',
            error: error.message,
        });
    }
});

// Export router and service metadata in one object
export { router, serviceMetadata };
