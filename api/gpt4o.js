import express from 'express';
import GPT4js from 'gpt4js';

const router = express.Router();

// Options for the GPT-4o model
const options = {
  provider: "Nextway",
  model: "gpt-4o-free",
};

// Function to format and display the entire response
const prettyJsonResponse = (responseData) => {
  const formattedResponse = {
    responses: responseData.response || "No response content",  // Adjust this according to the actual structure
    author: "Jerome"
  };
  return JSON.stringify(formattedResponse, null, 2); // Pretty print with indentation
};

// Route to handle GPT-4o response
router.get('/gpt4o-response', async (req, res) => {
  const { prompt } = req.query;

  if (!prompt) {
    return res.type('json').send(JSON.stringify({
      error: "Missing 'prompt' query parameter."
    }, null, 2));
  }

  // Modify the messages to include the user prompt
  const messagesWithUserPrompt = [{ role: "user", content: prompt }];

  try {
    const provider = GPT4js.createProvider(options.provider);

    // Request a chat completion from the provider
    const responses = await provider.chatCompletion(messagesWithUserPrompt, options);

    // Check if the responses array is returned and then format the output
    if (Array.isArray(responses) && responses.length > 0) {
      // Collect all responses if there are multiple
      const allResponses = responses.map(response => ({
        response: response.response || "No response content",
        author: "Jerome"
      }));

      // Return all responses in JSON format
      res.type('json').send(JSON.stringify({ responses: allResponses }, null, 2));
    } else {
      res.type('json').send(prettyJsonResponse(responses));
    }

  } catch (error) {
    console.error("Error:", error);
    res.type('json').send(JSON.stringify({
      status: "error",
      message: "An error occurred while processing your request.",
      error: error.message
    }, null, 2));
  }
});

// Route metadata (for documentation purposes)
const serviceMetadata = {
  name: "GPT-4o API",
  author: "Jerome",
  description: "A route to interact with the GPT-4o model, generating responses based on user input.",
  category: "AI",
  link: ["/api/gpt4o-response?prompt=hi"]
};

export { router, serviceMetadata };
