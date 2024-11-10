import express from 'express';
import axios from 'axios';

const router = express.Router();

// Define service metadata
const serviceMetadata = {
  name: "Playstore API",
  author: "Jerome Jamis",
  description: "Fetches Google Play Store app data based on a search query.",
  category: "Search",
  link: [
    "/api/playstore?q=Facebook"
  ]
};

// Define the route for Playstore API
router.get('/playstore', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json(JSON.stringify({
      error: "Query parameter 'q' is required.",
      message: "Please provide a search query to fetch Google Play Store app data.",
      exampleUsage: "/service/playstore?q=your_search_query"
    }, null, 2)); // Pretty JSON with indentation of 2 spaces
  }

  try {
    const apiResponse = await axios.get(`https://serpapi.com/search`, {
      params: {
        engine: 'google_play',
        q: query,
        api_key: 'YOUR_SERPAPI_KEY', // Replace with actual SerpApi key
      },
    });

    // Ensure response contains expected data
    if (apiResponse.data && apiResponse.data.organic_results) {
      return res.json(JSON.stringify({
        metadata: serviceMetadata,
        search_metadata: apiResponse.data.search_metadata,
        search_parameters: apiResponse.data.search_parameters,
        app_highlight: apiResponse.data.app_highlight,
        organic_results: apiResponse.data.organic_results,
      }, null, 2)); // Pretty JSON with indentation of 2 spaces
    } else {
      return res.status(404).json(JSON.stringify({
        error: "No results found.",
        message: "The search did not return any results for the provided query."
      }, null, 2)); // Pretty JSON with indentation of 2 spaces
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json(JSON.stringify({
      error: "Internal Server Error",
      message: "Error fetching data from SerpApi. Please try again later.",
      errorDetails: error.message
    }, null, 2)); // Pretty JSON with indentation of 2 spaces
  }
});

export { router, serviceMetadata };
