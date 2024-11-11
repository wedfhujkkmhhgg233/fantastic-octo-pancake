import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service metadata for your route
const serviceMetadata = {
  name: "Evil Insult Generator",
  author: "Jerome Jamis",
  description: "Generates a random evil insult",
  category: "Others",
  link: ["/api/evilinsult"]
};

// Define the Evil Insult route
router.get('/evilinsult', async (req, res) => {
  try {
    // Fetch insult from EvilInsult API
    const response = await axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json');

    // Ensure response is in JSON format
    if (response.headers['content-type'].includes('application/json')) {
      // Pretty-print the response with 2-space indentation
      const prettyResponse = JSON.stringify({
        metadata: serviceMetadata,
        insult: response.data.insult,
        number: response.data.number,
        language: response.data.language,
        created: response.data.created,
        shown: response.data.shown
      }, null, 2); // Pretty print with 2-space indentation

      // Set the Content-Type header to application/json
      res.setHeader('Content-Type', 'application/json');
      return res.send(prettyResponse);
    } else {
      return res.status(500).json({
        error: "Unexpected response format",
        message: "The response from EvilInsult API was not in expected JSON format."
      });
    }
  } catch (error) {
    console.error("Error fetching data from EvilInsult API:", error);
    return res.status(500).json({
      error: "Error fetching data from EvilInsult",
      message: "An error occurred while fetching data from the EvilInsult API.",
      errorDetails: error.message
    });
  }
});

export { router, serviceMetadata }; // Export the router and metadata
