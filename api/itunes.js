import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Get the current directory in ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Service metadata for your route
const serviceMetadata = {
  name: "iTunes Music Search",
  author: "Jerome Jamis",
  description: "Fetches music search results from iTunes API based on the query term.",
  category: "Music",
  link: ["/api/itunes?term=Faded Alan Walker&media=music&limit=10"]
};

// Define the iTunes search route
router.get('/itunes', async (req, res) => {
  const { term, media, limit } = req.query;

  // Validate required parameters
  if (!term) {
    return res.status(400).json({
      error: "Missing required parameter 'term'",
      message: "Please provide a 'term' parameter for searching.",
      exampleUsage: "/service/itunes?term=faded&media=music&limit=10"
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

    // Log the response headers to inspect content type
    console.log("iTunes API response headers:", response.headers);

    // Check if the response content type is JSON
    if (response.headers['content-type'] && response.headers['content-type'].includes('application/json')) {
      // If the response is in JSON format, handle it
      const prettyResponse = JSON.stringify({
        metadata: serviceMetadata,
        resultCount: response.data.resultCount,
        results: response.data.results
      }, null, 2); // Pretty print with 2-space indentation

      // Save the JSON response to a file
      const filePath = path.join(__dirname, 'itunes.json');
      fs.writeFileSync(filePath, prettyResponse); // Save the response

      // Send the response back as JSON
      res.setHeader('Content-Type', 'application/json');
      return res.send(prettyResponse);
    } else {
      // If the response isn't JSON, log it and return an error
      console.error("iTunes API did not return JSON. Response:", response.data);
      return res.status(500).json({
        error: "Unexpected response format",
        message: "The response from iTunes API was not in expected JSON format.",
        rawResponse: response.data
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

// Export both the router and serviceMetadata
export { router, serviceMetadata };
