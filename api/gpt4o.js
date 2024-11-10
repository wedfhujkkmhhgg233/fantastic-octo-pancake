import express from 'express';
import GPT4js from 'gpt4js';
import axios from 'axios';

const router = express.Router();

// Define the system and user messages
const messages = [
  { role: "system", content: "You're an expert bot in programming." },
  { role: "user", content: "Hi, write me something." },
];

// Options for the GPT-4o model
const options = {
  provider: "Nextway",
  model: "gpt-4o-free",
};

// Function to format and display the JSON response with the author field
const prettyJsonResponse = (responseData) => {
  // Add the author field to the response data
  const responseWithAuthor = {
    ...responseData,
    author: "Jerome"
  };
  return JSON.stringify(responseWithAuthor, null, 2); // Pretty print with indentation
};

// Route to handle GPT-4o response
router.get('/gpt4o-response', async (req, res) => {
  const { prompt } = req.query;

  if (!prompt) {
    return res.type('json').send(JSON.stringify({
      error: "Missing 'prompt' query parameter."
    }, null, 2));
  }

  const messagesWithUserPrompt = [
    { role: "system", content: "You're an expert bot in programming." },
    { role: "user", content: prompt },  // Using user prompt from the query parameter
  ];

  try {
    const provider = GPT4js.createProvider(options.provider);

    // Request a chat completion from the provider
    const text = await provider.chatCompletion(messagesWithUserPrompt, options, (data) => {
      console.log(prettyJsonResponse(data));
    });

    // Return the response in JSON format with author field
    res.type('json').send(prettyJsonResponse(text));

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
