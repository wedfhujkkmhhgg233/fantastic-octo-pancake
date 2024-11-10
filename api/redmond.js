import express from 'express'
import axios from 'axios'

const router = express.Router()

// Route for Redmond image generation requests
router.get('/redmond-image', async (req, res) => {
    const { prompt, prompt_negative } = req.query

    if (!prompt) {
        return res.type('json').send(JSON.stringify({
            error: "Missing 'prompt' query parameter."
        }, null, 2))
    }

    try {
        // Initial POST request to start image generation with Redmond model
        const result = await axios.post('https://nexra.aryahcr.cc/api/image/complements', {
            prompt: prompt,
            model: "3d-redmond",
            data: {
                prompt_negative: prompt_negative || ""
            }
        }, {
            headers: {
                "Content-Type": "application/json",
                "x-nexra-user": "user-xxxxxxxx",
                "x-nexra-secret": "nx-xxxxxxx-xxxxx-xxxxx"
            }
        })

        const id = result.data.id
        let response = null
        let data = true

        while (data) {
            // Polling the Redmond API for task completion
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
                        message: "Image generated successfully by Redmond model.",
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
    name: "Redmond Image Generation API",
    author: "Jerome",
    description: "A route to interact with the Redmond model, generating a 3D image based on a user-provided prompt.",
    category: "AI Image Generation",
    link: ["/api/redmond-image?prompt=dog"]
}

export { router, serviceMetadata }
