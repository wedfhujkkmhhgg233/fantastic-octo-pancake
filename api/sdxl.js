import express from 'express'
import axios from 'axios'

const router = express.Router()

// Route for Stable Diffusion image generation
router.get('/sdxl-image', async (req, res) => {
    const { prompt } = req.query

    if (!prompt) {
        return res.type('json').send(JSON.stringify({
            error: "Missing 'prompt' query parameter."
        }, null, 2))
    }

    try {
        // POST request to initiate image generation with the Stable Diffusion model
        const result = await axios.post('https://nexra.aryahcr.cc/api/image/complements', {
            prompt: prompt,
            model: "stablediffusion-1.5"
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const id = result.data.id
        let response = null
        let data = true

        // Polling for completion
        while (data) {
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
                        message: "Image generated successfully by Stable Diffusion model.",
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
    name: "Stable Diffusion Image Generation API",
    author: "Jerome",
    description: "A route to interact with the Stable Diffusion model, generating an image based on a scenic sunset landscape prompt.",
    category: "AI Image Generation",
    link: ["/api/sdxl-image?prompt=dog"]
}

export { router, serviceMetadata }
