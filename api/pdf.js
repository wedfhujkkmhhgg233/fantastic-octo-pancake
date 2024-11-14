import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

const serviceMetadata = {
  name: 'Refseek Search',
  author: 'Jerome',
  description: 'Search for documents on Refseek based on a search term.',
  category: 'Search',
  link: ['/api/refseeksearch?prompt=dog']
};

const url = 'https://www.refseek.com/documents';

// Function to perform the Refseek search
async function fetchRefseekResults(query) {
  try {
    const response = await axios.get(`${url}?search=${encodeURIComponent(query)}`);
    const html = response.data;

    // Parse the HTML response with Cheerio
    const $ = cheerio.load(html);

    // Extract search results
    const results = $('.search__result').map((index, element) => ({
      title: $(element).find('.result__title').text().trim(),
      link: $(element).find('a').attr('href'),
      description: $(element).find('.result__description').text().trim(),
    })).get();

    return results;
  } catch (error) {
    throw new Error(`Error fetching data from Refseek: ${error.message}`);
  }
}

// Route for Refseek search
router.get('/refseeksearch', async (req, res) => {
  const { prompt } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: 'Please provide a "prompt" query parameter.' });
  }

  try {
    const results = await fetchRefseekResults(prompt);

    // Pretty-print JSON response
    res.json(JSON.parse(JSON.stringify({ metadata: serviceMetadata, data: results }, null, 2)));
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data from Refseek', details: error.message });
  }
});

export { router, serviceMetadata };
