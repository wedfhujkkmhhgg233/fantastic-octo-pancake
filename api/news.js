import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service Metadata
export const serviceMetadata = {
  name: 'News Finder',
  author: 'Jerome Jamis',
  description: 'Fetches news articles from the Perigon News API.',
  category: 'Search',
  link: ['/api/news?query=&count='],
};

// Route to fetch news
router.get('/news', async (req, res) => {
  const { query, count = 10 } = req.query; // Default count to 10

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

  const url = `https://api.goperigon.com/v1/all?apiKey=c97dcc8c-740c-46d2-b7fa-c68ed50d209c&q=${query}`;

  try {
    const response = await axios.get(url);

    // Get articles and limit to the specified count
    const articles = response.data.articles.slice(0, count).map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source?.name || 'Unknown',
      publishedAt: article.published_at,
      content: article.content,
    }));

    // Send the formatted response with pretty JSON
    res.status(200).send(
      JSON.stringify(
        {
          status: 'success',
          totalResults: response.data.articles.length,
          count: articles.length,
          articles,
        },
        null,
        2 // Pretty JSON formatting
      )
    );
  } catch (error) {
    console.error('Error fetching news:', error.message);
    const errorResponse = error.response ? error.response.data : {};
    res.status(500).send(
      JSON.stringify(
        {
          status: 'error',
          message: 'Failed to fetch news articles',
          error: error.message,
          response: errorResponse,
        },
        null,
        2 // Pretty JSON formatting
      )
    );
  }
});

export { router };
