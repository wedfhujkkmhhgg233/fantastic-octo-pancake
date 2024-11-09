import express from 'express';
import llama2 from 'gpti';

const router = express.Router();

// Route for handling LLAMA model requests via GET
router.get('/llama', (req, res) => {
    const { prompt } = req.query;

    // Ensure prompt is provided
    if (!prompt) {
        return res.status(400).json({
            error: "Missing 'prompt' query parameter."
        });
    }

    // Build the message history for the LLAMA model
    const history = [
        { role: "assistant", content: "Hello! How are you?" },
        { role: "user", content: prompt }
    ];

    // Call the LLAMA model
    llama2({
        messages: history,
        system_message: "",
        temperature: 0.9,
        max_tokens: 4096,
        top_p: 0.6,
        repetition_penalty: 1.2,
        markdown: false,
        stream: false
    }, (err, data) => {
        if (err) {
            // Send an error response in pretty-printed JSON
            const errorResponse = {
                status: "error",
                message: "An error occurred while processing your request.",
                error: err
            };
            return res.status(500).json(JSON.stringify(errorResponse, null, 2));
        }

        // Send the data response in pretty-printed JSON
        const successResponse = {
            status: "success",
            message: "LLAMA response generated successfully.",
            data: data
        };

        // Return the response in pretty-printed JSON format
        res.type('json').send(JSON.stringify(successResponse, null, 2));
    });
});

// Route metadata
const serviceMetadata = {
    name: "LLAMA Model API",
    author: "Jerome",
    description: "A route to interact with the LLAMA model by providing a prompt.",
    category: "AI Interaction",
    link: ["/llama?prompt="]
};

export { router, serviceMetadata };
