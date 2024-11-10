import express from 'express'
import axios from 'axios'

const router = express.Router()

// Route for SDXL image generation requests
router.get('/sdxl-image', async (req, res) => {
    const { prompt, guidance, steps } = req.query

    if (!prompt) {
        return res.type('json').send(JSON.stringify({
            error: "Missing 'prompt' query parameter."
        }, null, 2))
    }

    try {
        // Initial POST request to start image generation with SDXL model
        const result = await axios.post('https://nexra.aryahcr.cc/api/image/complements', {
            prompt: prompt,
            model: "sdxl-lora",
            data: {
                guidance: parseFloat(guidance) || 0.3,
                steps: parseInt(steps) || 2
            }
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const id = result.data.id
        let response = null
        let data = true

        while (data) {
            // Polling the SDXL API for task completion
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
                        message: "Image generated successfully by SDXL model.",
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
    name: "SDXL Image Generation API",
    author: "Jerome",
    description: "A route to interact with the SDXL model, generating an image based on a futuristic city prompt.",
    category: "AI Image Generation",
    link: ["/sdxl-image?prompt=dog"]
}

export { router, serviceMetadata }
