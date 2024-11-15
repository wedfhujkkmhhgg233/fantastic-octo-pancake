import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service Metadata
export const serviceMetadata = {
  name: 'News Search',
  author: 'Jerome Jamis',
  description: 'Fetches news articles based on a query.',
  category: 'Searxh',
  link: ['/api/news?query=&count='],
};

// Route to fetch news
router.get('/news', async (req, res) => {
  const { query, count = 1 } = req.query; // Default count to 1 article

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

  const url = `https://newsapi.org/v2/everything?q=${query}&pageSize=${count}&apiKey=076c9b4b063c40d0b13a9f5be858877f`;

  try {
    // Fetching the data from the News API
    const response = await axios.get(url);

    // Check if the API response status is 'ok' and articles are present
    if (response.data.status === 'ok' && response.data.articles.length > 0) {
      // Extract and structure the response data
      const articles = response.data.articles.map(article => ({
        source: article.source.name,
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        content: article.content,
      }));

      // Send the structured data as a pretty JSON response
      res.status(200).send(JSON.stringify(articles, null, 2));
    } else {
      // If no articles are found, return the message in pretty JSON
      const errorMessage = {
        status: 'error',
        message: 'No articles found for the given query.',
        query: query,
        count: count,
        response: JSON.stringify(response.data, null, 2), // Pretty print the whole response
      };

      res.status(404).send(JSON.stringify(errorMessage, null, 2));
    }
  } catch (error) {
    console.error('Error fetching news:', error.message);

    // If error contains response from the API, log the full response
    if (error.response) {
      const errorMessage = {
        status: 'error',
        message: 'Failed to fetch news articles',
        error: error.message,
        response: JSON.stringify(error.response.data, null, 2), // Pretty print full error response from API
      };

      // Send the full error message and API response (if available) in pretty JSON
      res.status(500).send(JSON.stringify(errorMessage, null, 2));
    } else {
      // If no response from the API, log the error message and send a generic error
      const errorMessage = {
        status: 'error',
        message: 'An error occurred while fetching news articles',
        error: error.message,
      };

      res.status(500).send(JSON.stringify(errorMessage, null, 2));
    }
  }
});

export { router };
