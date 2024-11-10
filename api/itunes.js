import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Service metadata for your route
const serviceMetadata = {
  name: "iTunes Music Search",
  author: "Jerome Jamis",
  description: "Fetches music search results from iTunes API based on the query term.",
  category: "Music",
  link: ["/api/itunes?term=Faded Alan Walker&media=&limit="]
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
      },
      responseType: 'arraybuffer' // Download the content as a binary stream
    });

    // Ensure response is received as a file
    if (response.data) {
      // Write the downloaded content to a file (itunes.json)
      const filePath = path.join(__dirname, 'itunes.json');
      fs.writeFileSync(filePath, response.data);  // Save the raw response

      // Read the saved JSON file and parse it
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const parsedContent = JSON.parse(fileContent); // Parse it as JSON

      // Send the formatted response
      const prettyResponse = JSON.stringify({
        metadata: serviceMetadata,
        resultCount: parsedContent.resultCount,
        results: parsedContent.results
      }, null, 2); // Pretty print with 2-space indentation

      // Set the Content-Type header to application/json
      res.setHeader('Content-Type', 'application/json'); 

      return res.send(prettyResponse);
    } else {
      return res.status(500).json({
        error: "No data received",
        message: "No data was received from the iTunes API."
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
