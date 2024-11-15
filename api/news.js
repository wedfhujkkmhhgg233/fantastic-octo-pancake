import express from 'express';
import Parser from 'rss-parser';

const router = express.Router();
const parser = new Parser();

// Service Metadata
export const serviceMetadata = {
  name: 'Google News Fetcher',
  author: 'Jerome Jamis',
  description: 'Fetches Google News articles based on a query.',
  category: 'Search',
  link: ['/news?query=Cat&count='],
};

// Route to fetch Google News
router.get('/news', async (req, res) => {
  const { query, count = 10 } = req.query; // Default count to 10

  // Validate the query parameter
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
    // Build the RSS feed URL
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    // Parse the RSS feed
    const feed = await parser.parseURL(url);

    // Limit the results to the requested count
    const articles = feed.items.slice(0, parseInt(count)).map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item.contentSnippet,
      source: item.source || 'Google News',
    }));

    // Send the articles as a JSON response
    res.status(200).json(articles);
  } catch (error) {
    console.error('Error fetching Google News RSS feed:', error.message);

    // Send a detailed error response
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch Google News RSS feed',
      error: error.message,
    });
  }
});

export { router };
