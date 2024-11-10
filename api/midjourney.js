import express from 'express'
import axios from 'axios'

const router = express.Router()

// Route for handling MidJourney image generation requests
router.get('/midjourney-image', async (req, res) => {
    const { prompt } = req.query

    if (!prompt) {
        return res.type('json').send(JSON.stringify({
            error: "Missing 'prompt' query parameter."
        }, null, 2))
    }

    try {
        // Initial POST request to start the image generation
        const result = await axios.post('https://nexra.aryahcr.cc/api/image/complements', {
            prompt: prompt,
            model: "midjourney",
            // Uncomment to receive base64 response
            // response: "base64"
        }, {
            headers: { 'Content-Type': 'application/json' }
        })

        const id = result.data.id
        let response = null
        let data = true

        while (data) {
            // Polling the MidJourney API for task completion
            response = await axios.get(`http://nexra.aryahcr.cc/api/image/complements/${encodeURIComponent(id)}`)
            response = response.data
            console.log(response)

            switch (response.status) {
                case "pending":
                    data = true
                    break
                case "completed":
                    data = false
                    res.type('json').send(JSON.stringify({
                        status: "success",
                        message: "Image generated successfully by MidJourney model.",
                        data: response
                    }, null, 2))
                    break
                case "error":
                case "not_found":
                    data = false
                    res.type('json').send(JSON.stringify({
                        status: "error",
                        message: "An error occurred while processing your request.",
                        error: response
                    }, null, 2))
                    break
            }
        }
    } catch (error) {
        res.type('json').send(JSON.stringify({
            status: "error",
            message: "An error occurred while processing your request.",
            error: error.message
        }, null, 2))
    }
})

// Route metadata
const serviceMetadata = {
    name: "MidJourney Image Generation API",
    author: "Jerome",
    description: "A route to interact with the MidJourney image generation model by providing a prompt.",
    category: "AI Image Generation",
    link: ["/api/midjourney-image?prompt=<YOUR_IMAGE_PROMPT_HERE>"]
}

export { router, serviceMetadata }
