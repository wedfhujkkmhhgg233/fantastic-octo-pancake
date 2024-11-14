import express from 'express';
import puppeteer from 'puppeteer';

const router = express.Router();

const serviceMetadata = {
  name: 'Refseek PDF Search',
  author: 'Jerome',
  description: 'Search for PDF documents on Refseek based on a search term.',
  category: 'Search',
  link: ['/api/refseekpdfsearch?prompt=dog']
};

// Function to scrape PDF links and titles using Puppeteer
async function scrapePDFLinksAndTitles(searchQuery) {
  try {
    // Initialize Puppeteer and launch the browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Replace spaces with '+' for URL encoding
    const query = searchQuery.replace(/\s+/g, '+');
    const url = `https://www.refseek.com/documents?search=${query}`;

    // Navigate to the page and wait for the content to load
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Extract the required information (PDF links, titles, and descriptions)
    const pdfDocuments = await page.evaluate(() => {
      const results = [];
      // Scrape each search result element
      const items = document.querySelectorAll('.search__result');
      items.forEach(item => {
        const linkElement = item.querySelector('a');
        const link = linkElement ? linkElement.href : '';
        const title = item.querySelector('.result__title') ? item.querySelector('.result__title').innerText : 'No title available';
        const description = item.querySelector('.result__description') ? item.querySelector('.result__description').innerText : 'No description available';

        // Only include PDF links
        if (link && link.endsWith('.pdf')) {
          results.push({ title, description, link });
        }
      });
      return results;
    });

    // Close the browser
    await browser.close();

    // Return the results
    return pdfDocuments;
  } catch (error) {
    throw new Error(`Error fetching PDF links and titles: ${error.message}`);
  }
}

// Route for Refseek PDF search
router.get('/refseekpdfsearch', async (req, res) => {
  const { prompt } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: 'Please provide a "prompt" query parameter.' });
  }

  try {
    const results = await scrapePDFLinksAndTitles(prompt);

    // Pretty-print JSON response
    res.json(JSON.parse(JSON.stringify({ metadata: serviceMetadata, data: results }, null, 2)));
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve PDF data from Refseek', details: error.message });
  }
});

export { router, serviceMetadata };
