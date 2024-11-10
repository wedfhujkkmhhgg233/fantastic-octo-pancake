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

    // Ensure response is in JSON format
    if (response.headers['content-type'].includes('application/json')) {
      // Define the path to save the file
      const filePath = path.join(__dirname, 'itunes.json');

      // Prepare the data to be saved, including metadata and iTunes results
      const dataToSave = {
        metadata: serviceMetadata,
        resultCount: response.data.resultCount,
        results: response.data.results
      };

      // Save the data to a file
      fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2)); // Pretty print with 2-space indentation

      // Read the saved JSON file
      const savedData = fs.readFileSync(filePath, 'utf-8');

      // Set headers explicitly to treat the response as JSON and prevent download
      res.setHeader('Content-Type', 'application/json'); // Ensure response is treated as JSON
      res.setHeader('Content-Disposition', 'inline'); // Prevent file download

      return res.send(savedData); // Send the saved JSON content

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

// Export both the router and serviceMetadata
export { router, serviceMetadata };
