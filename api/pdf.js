import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

const serviceMetadata = {
  name: 'PDF Search',
  author: 'Jerome',
  description: 'Search for PDF documents based on a search term.',
  category: 'Search',
  link: ['/api/pdfsearch?prompt=cat']
};

const url = 'https://www.pdfsearch.io/index.php'; // URL for the scraping service

// Function to perform the PDF search
async function searchPDFDocuments(query) {
  const results = [];
  try {
    // Send the POST request to initiate the search
    const searchResponse = await axios.post(url, new URLSearchParams({
      a: query
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
      }
    });

    const $ = cheerio.load(searchResponse.data);

    // Extract total result count
    const resultCount = $('blockquote h4').text().replace('Results: ', '').trim();

    // Parse each document result (adjust selectors if necessary)
    $('div.result-item').each((i, elem) => {
      const title = $(elem).find('.document-title').text().trim();
      const link = $(elem).find('a').attr('href');
      if (title && link) {
        results.push({ title, link: `https://www.pdfsearch.io${link}` });
      }
    });

    return { query, resultCount, results };
  } catch (error) {
    throw new Error(`Error fetching search results: ${error.message}`);
  }
}

// Route for PDF search
router.get('/pdfsearch', async (req, res) => {
  const { prompt } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: 'Please provide a "prompt" query parameter.' });
  }

  try {
    const results = await searchPDFDocuments(prompt);

    // Pretty-print JSON response
    res.json(JSON.parse(JSON.stringify({ metadata: serviceMetadata, data: results }, null, 2)));
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data from PDFSearch.io', details: error.message });
  }
});

export { router, serviceMetadata };
