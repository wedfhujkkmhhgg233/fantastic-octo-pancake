import express from 'express';
import GPT4js from 'gpt4js';

const router = express.Router();

// Route for GPT-4o chat interaction
router.get('/gpt4o-chat', async (req, res) => {
  const { message } = req.query;  // Expecting the message in the query parameter

  if (!message) {
    return res.status(400).json({ error: "Missing 'message' query parameter" });
  }

  const options = {
    provider: "Nextway",
    model: "gpt-4o-free",
  };

  const messages = [{ role: "user", content: message }];
  const provider = GPT4js.createProvider(options.provider);

  try {
    // Get the full response from GPT-4o
    const data = await provider.chatCompletion(messages, options);

    res.json({
      status: "success",
      response: data,  // Returning the full response from GPT-4o
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing your request.",
      error: error.message,
    });
  }
});

// Route metadata
const serviceMetadata = {
  name: "GPT-4o Chat API",
  author: "Jerome",
  description: "A route to interact with the GPT-4o model, sending a user message and getting a response.",
  category: "AI",
  link: ["/gpt4o-chat?message=hi"]
};

export { router, serviceMetadata };
