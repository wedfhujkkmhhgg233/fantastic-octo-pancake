import express from 'express';

const router = express.Router();

router.get('/search', async (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.status(400).json({
            error: "Please add ?query=your_search_query"
        });
    }

    try {
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
        const data = await response.json();

        if (!data || !data.RelatedTopics || data.RelatedTopics.length === 0) {
            return res.status(404).json({
                error: "No search results found"
            });
        }

        const results = data.RelatedTopics.map(item => ({
            title: item.Text,
            url: item.FirstURL
        }));

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(results, null, 2));

    } catch (error) {
        console.error("Error performing search:", error);
        res.status(500).json({
            error: "Failed to perform search"
        });
    }
});

const serviceMetadata = {
    name: "DuckDuckGo Search",
    author: "Jerome",
    description: "Search for a topic on DuckDuckGo",
    category: "tools",
    link: ["/api/search?query=who%20is%20Jose%20Rizal"]
};

export { router, serviceMetadata };
