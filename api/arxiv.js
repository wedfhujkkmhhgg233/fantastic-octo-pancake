import express from 'express';
import axios from 'axios';
import xml2js from 'xml2js';

const router = express.Router();
const parseStringPromise = xml2js.parseStringPromise;

// arXiv fetch and parse route
router.get('/arxiv', async (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        // Fetch data from arXiv API
        const arxivUrl = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=1`;
        const response = await axios.get(arxivUrl);

        // Parse XML response to JSON
        const xmlData = await parseStringPromise(response.data, { trim: true, explicitArray: false });
        const feed = xmlData.feed;
        const entry = feed.entry;

        // Format the response data
        const result = {
            query_info: {
                search_query: `all:${query}`,
                query_url: feed.link.href,
                total_results: feed['opensearch:totalResults']
            },
            article: {
                id: entry.id,
                updated: entry.updated,
                published: entry.published,
                title: entry.title,
                summary: entry.summary.replace(/\n/g, " "),
                authors: Array.isArray(entry.author) ? entry.author.map(author => author.name) : [entry.author.name],
                links: {
                    html: entry.link[0].href,
                    pdf: entry.link[1].href
                }
            }
        };

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing arXiv request: ' + error.message });
    }
});

// Service metadata
const serviceMetadata = {
    name: "arXiv Article Fetcher",
    author: "Jerome",
    description: "Fetches and parses arXiv article data.",
    category: "Academic",
    link: ["/api/arxiv?query="]
};

export { router, serviceMetadata };
