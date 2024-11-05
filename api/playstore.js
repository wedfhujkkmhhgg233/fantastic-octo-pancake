import express from 'express';
import gplay from 'google-play-scraper'; // This is the only package needed for Google Play scraping

const router = express.Router();

// Route to search for apps on the Google Play Store
router.get('/playstore', async (req, res) => {
    const { name } = req.query; // Extract 'name' parameter from the query string

    if (!name) {
        return res.status(400).json({
            error: "Please add ?name=app_name"
        });
    }

    try {
        // Search for apps with the specified name
        const results = await gplay.search({
            term: name,
            num: 10 // Limit the number of results, change if you want more
        });

        if (results.length === 0) {
            return res.status(404).json({
                error: "No apps found for the provided name"
            });
        }

        // Return all relevant details for each app found
        const appDetails = results.map(app => ({
            title: app.title,
            appId: app.appId,
            url: app.url,
            developer: app.developer,
            icon: app.icon,
            summary: app.summary,
            score: app.score
        }));

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(appDetails, null, 2));

    } catch (error) {
        console.error("Error fetching app details:", error);
        res.status(500).json({
            error: "Failed to retrieve app details"
        });
    }
});

const serviceMetadata = {
    name: "Play Store Search",
    author: "Jerome",
    description: "Search for apps on the Google Play Store by name",
    category: "app store",
    link: ["/api/playstore?name=Facebook"]
};

export { router, serviceMetadata };
