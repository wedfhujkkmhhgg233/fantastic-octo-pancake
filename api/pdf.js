import express from 'express';
import google from 'googleapis';

const router = express.Router();
const CSE_ID = 'd5183818b834444bd';
const API_KEY = 'AIzaSyDL9QfgjBAHn835ncpmfnp6uOP3SuuTJMQ';

const serviceMetadata = {
  name: 'PDF Search',
  author: 'Jerome',
  description: 'Search for PDF documents.',
  category: 'Search',
  link: ['/api/pdfsearch?prompt=dog&count=']
};

// Custom search function to fetch PDFs and their descriptions
async function googleSearch(query, count = 10) {
  const customsearch = google.google.customsearch('v1');
  try {
    // Perform search with the query
    const res = await customsearch.cse.list({
      cx: CSE_ID,
      q: query,
      auth: API_KEY,
      fileType: 'pdf', // Ensure we are searching for PDFs
      num: count, // Number of results to fetch, dynamically set
    });

    // Filter and map the PDF links with their descriptions
    const pdfResults = res.data.items
      .filter(item => item.link.endsWith('.pdf'))
      .map(item => ({
        title: item.title,
        link: item.link,
        description: item.snippet || 'No description available'
      }));

    return pdfResults;
  } catch (error) {
    console.error('Error occurred during Google search:', error);
    return [];
  }
}

// Route to handle PDF search via Google Custom Search
router.get('/pdfsearch', async (req, res) => {
  const { prompt, count } = req.query;
  
  // Validate if prompt is provided
  if (!prompt) {
    return res.status(400).json({ error: 'Please provide a search query with the "prompt" parameter.' });
  }

  // Set a default count if not provided
  const searchCount = count ? parseInt(count, 10) : 10;

  try {
    const results = await googleSearch(prompt, searchCount);

    if (results.length > 0) {
      // Respond with pretty-printed JSON
      res.json({
        metadata: serviceMetadata,
        data: JSON.parse(JSON.stringify(results, null, 2)) // Pretty JSON output
      });
    } else {
      res.json({
        metadata: serviceMetadata,
        data: 'No PDFs found.'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve PDF results.',
      details: error.message
    });
  }
});

export { router, serviceMetadata };
