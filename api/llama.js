import express from 'express'
import axios from 'axios'

const router = express.Router()

// Route for handling LLAMA model requests via GET
router.get('/llama', async (req, res) => {
    const { prompt } = req.query

    // Ensure prompt is provided
    if (!prompt) {
        return res.status(400).json({
            error: "Missing 'prompt' query parameter."
        })
    }

    // Build the message history for the LLAMA model
    const history = [
        { role: "assistant", content: "Hello! How are you?" },
        { role: "user", content: prompt }
    ]

    try {
        // Make a request to the external API using axios
        const response = await axios.post('https://nexra.aryahcr.cc/api/chat/complements', {
            messages: history,
            model: "llama2",
            data: {
                system_message: "",
                temperature: 0.9,
                max_tokens: 4096,
                top_p: 0.6,
                repetition_penalty: 1.2
            },
            markdown: false
        })

        // Send the success response in pretty-printed JSON format
        const successResponse = {
            status: "success",
            message: "LLAMA response generated successfully.",
            data: response.data
        }

        res.type('json').send(JSON.stringify(successResponse, null, 2))
    } catch (error) {
        // Handle errors and send a formatted JSON error response
        const errorResponse = {
            status: "error",
            message: "An error occurred while processing your request.",
            error: error.message
        }

        res.status(500).type('json').send(JSON.stringify(errorResponse, null, 2))
    }
})

// Route metadata
const serviceMetadata = {
    name: "LLAMA Model API",
    author: "Jerome",
    description: "A route to interact with the LLAMA model by providing a prompt.",
    category: "AI",
    link: ["/api/llama?prompt="]
}

export { router, serviceMetadata }
