import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service Metadata
export const serviceMetadata = {
  name: 'News API',
  author: 'Jerome Jamis',
  description: 'Fetches news articles based on query and count.',
  category: 'News',
  link: ['/news?query=Weather Philippines&count='],
};

// Your NewsAPI key
const apiKey = '076c9b4b063c40d0b13a9f5be858877f';

// Route to fetch news
router.get('/news', async (req, res) => {
  const { query = 'technology', count = 10 } = req.query; // Default query is 'technology' and count is 10
  const url = `https://newsapi.org/v2/everything?q=${query}&pageSize=${count}&apiKey=${apiKey}`;

  try {
    const response = await axios.get(url);

    // Format and forward the response
    res.setHeader('Content-Type', 'application/json');
    res.send(
      JSON.stringify(
        {
          status: response.data.status,
          totalResults: response.data.totalResults,
          articles: response.data.articles.map(article => ({
            source: article.source,
            author: article.author,
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.urlToImage,
            publishedAt: article.publishedAt,
            content: article.content,
          })),
        },
        null,
        2 // Pretty print with 2 spaces
      )
    );
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch news articles',
    });
  }
});

export { router };
