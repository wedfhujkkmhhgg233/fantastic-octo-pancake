import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service metadata for your route
const serviceMetadata = {
  name: "iTunes Music Search",
  author: "Jerome Jamis",
  description: "Fetches music search results from iTunes API based on the query term.",
  category: "Music",
  link: ["/api/itunes?term=Faded Alan Walker &media=&limit="]
};

// Define the iTunes search route
router.get('/itunes', async (req, res) => {
  const { term, media, limit } = req.query;

  // Validate required parameters
  if (!term) {
    return res.status(400).json({
      error: "Missing required parameter 'term'",
      message: "Please provide a 'term' parameter for searching.",
      exampleUsage: "/itunes?term=faded&media=music&limit=10"
    });
  }

  // Set default media and limit if not provided
  const searchMedia = media || 'music';
  const searchLimit = limit || 10;

  try {
    // Make the API request to iTunes
    const response = await axios.get('https://itunes.apple.com/search', {
      params: {
        term: term,
        media: searchMedia,
        limit: searchLimit
      }
    });

    // Ensure response is in JSON format
    if (response.headers['content-type'].includes('application/json')) {
      const prettyResponse = JSON.stringify({
        metadata: serviceMetadata,
        resultCount: response.data.resultCount,
        results: response.data.results
      }, null, 2); // Pretty print with 2-space indentation

      res.setHeader('Content-Type', 'application/json'); // Ensure the response is JSON
      return res.send(prettyResponse);
    } else {
      return res.status(500).json({
        error: "Unexpected response format",
        message: "The response from iTunes API was not in expected JSON format."
      });
    }
  } catch (error) {
    console.error("Error fetching data from iTunes:", error);
    return res.status(500).json({
      error: "Error fetching data from iTunes",
      message: "An error occurred while fetching data from the iTunes API.",
      errorDetails: error.message
    });
  }
});

export { router, serviceMetadata };  // Export the router and metadata
