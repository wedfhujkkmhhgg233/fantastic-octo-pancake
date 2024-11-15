import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service Metadata
export const serviceMetadata = {
  name: 'News Search',
  author: 'Jerome Jamis',
  description: 'Fetches up to 10 news articles based on a query.',
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

  const url = `https://newsapi.org/v2/everything?q=${query}&pageSize=${count}&apiKey=076c9b4b063c40d0b13a9f5be858877f`;

  try {
    const response = await axios.get(url);

    // Extract articles
    const limitedArticles = response.data.articles.slice(0, Number(count));

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(
      JSON.stringify(
        {
          status: response.data.status,
          totalResults: response.data.totalResults,
          articles: limitedArticles.map(article => ({
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
        2 // Pretty JSON
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
