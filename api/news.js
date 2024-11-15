import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service Metadata
export const serviceMetadata = {
  name: 'News Finder',
  author: 'Jerome Jamis',
  description: 'Fetches news articles from the News.',
  category: 'Search',
  link: ['/api/news?query=&count='],
};

// Route to fetch news
router.get('/news', async (req, res) => {
  const { query, count = 10 } = req.query; // Default count to 10

  if (!query) {
    return res
      .status(400)
      .send(
        JSON.stringify(
          {
            status: 'error',
            message: 'Missing query parameter. Provide a topic or keyword to search for news.',
            guide: {
              usage: '/news?query=<search-term>&count=<number>',
              example: '/news?query=technology&count=5',
            },
          },
          null,
          2
        )
      );
  }

  const url = `https://api.goperigon.com/v1/all?apiKey=c97dcc8c-740c-46d2-b7fa-c68ed50d209c&q=${query}`;

  try {
    const response = await axios.get(url);

    // Process and filter the API response
    const articles = response.data.articles
      .slice(0, count)
      .map(article => ({
        title: article.title || 'No title available',
        description: article.description || 'No description available',
        url: article.url,
        source: article.source?.domain || 'Unknown source',
        publishedAt: article.pubDate,
        content: article.content || 'No content available',
        imageUrl: article.imageUrl || 'No image available',
      }));

    // Check if articles array is empty
    if (articles.length === 0) {
      return res
        .status(200)
        .send(
          JSON.stringify(
            {
              status: 'success',
              totalResults: response.data.numResults || 0,
              count: 0,
              articles: [],
              message: 'No articles found for the given query.',
            },
            null,
            2
          )
        );
    }

    // Send the formatted response with pretty JSON
    res
      .status(200)
      .send(
        JSON.stringify(
          {
            status: 'success',
            totalResults: response.data.numResults || 0,
            count: articles.length,
            articles,
          },
          null,
          2
        )
      );
  } catch (error) {
    console.error('Error fetching news:', error.message);

    const errorResponse = error.response ? error.response.data : {};
    res
      .status(500)
      .send(
        JSON.stringify(
          {
            status: 'error',
            message: 'Failed to fetch news articles',
            error: error.message,
            response: errorResponse,
          },
          null,
          2
        )
      );
  }
});

export { router };
