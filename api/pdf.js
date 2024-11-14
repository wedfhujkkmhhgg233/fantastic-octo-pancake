import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();
const serviceMetadata = {
  name: 'PDF Search',
  author: 'Jerome',
  description: 'Search on PDF documents based on a search term and page number.',
  category: 'Search',
  link: ['/api/pdfsearch?prompt=cat&page=1']
};

const url = "https://www.pdfsearch.io/index.php";  // URL for the scraping service

// Function to scrape PDF search results
async function scrapePdfSearch(query, pages = 1) {
    const results = [];

    try {
        for (let page = 1; page <= pages; page++) {
            // Prepare POST request data
            const formData = new URLSearchParams();
            formData.append('a', query);

            // Send the POST request
            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);

            // Extract total results
            const totalResultsText = $('h4').first().text();
            const totalResults = totalResultsText.match(/\d+/g) ? totalResultsText.match(/\d+/g)[0] : "N/A";

            console.log(`Total Results for "${query}": ${totalResults}`);

            // Extract pagination links
            const paginationLinks = [];
            $('ul.pagination li a').each((index, element) => {
                const pageLink = $(element).attr('href');
                if (pageLink) paginationLinks.push(pageLink);
            });

            console.log('Pagination Links:', paginationLinks);

            // Extract document results
            $('div.row').each((index, element) => {
                const resultTitle = $(element).find('h3').text().trim();
                const resultLink = $(element).find('a').attr('href');
                if (resultTitle && resultLink) {
                    results.push({
                        title: resultTitle,
                        link: `https://www.pdfsearch.io${resultLink}`
                    });
                }
            });

            console.log(`Page ${page} Results:`, results);
        }

    } catch (error) {
        console.error("Error during scraping:", error.message);
    }

    return results;
}

// Route for PDF search
router.get('/pdfsearch', async (req, res) => {
  const { prompt, page } = req.query;

  if (!prompt || !page) {
    return res.status(400).json({ error: 'Please provide both "prompt" and "page" query parameters.' });
  }

  try {
    const results = await scrapePdfSearch(prompt, parseInt(page, 10));

    // Pretty-print JSON response
    res.json(JSON.parse(JSON.stringify({ metadata: serviceMetadata, data: results }, null, 2)));
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data from PDFSearch.io', details: error.message });
  }
});

export { router, serviceMetadata };
