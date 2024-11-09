import express from 'express'
import axios from 'axios'

const router = express.Router()

// Route for handling Gemini Pro model requests
router.get('/gemini-pro', async (req, res) => {
    const { prompt, stream } = req.query

    if (!prompt) {
        return res.type('json').send(JSON.stringify({
            error: "Missing 'prompt' query parameter."
        }, null, 2))
    }

    const messages = [
        { role: "assistant", content: "" },
        { role: "user", content: prompt }
    ]

    try {
        // For streaming requests
        if (stream === 'true') {
            const response = await axios.post('https://nexra.aryahcr.cc/api/chat/complements', {
                messages,
                markdown: false,
                stream: true,
                model: "gemini-pro"
            }, {
                headers: { 'Content-Type': 'application/json' },
                responseType: "stream"
            })

            // Stream the response data back to the client
            response.data.on("data", (chunk) => {
                res.write(chunk)
            })

            response.data.on("end", () => {
                res.end()
            })

            response.data.on("error", (err) => {
                res.type('json').send(JSON.stringify({
                    code: 500,
                    status: false,
                    error: "INTERNAL_SERVER_ERROR",
                    message: "general (unknown) error",
                    detail: err.message
                }, null, 2))
            })
        } else {
            // For non-streaming requests
            const result = await axios.post('https://nexra.aryahcr.cc/api/chat/complements', {
                messages,
                markdown: false,
                stream: false,
                model: "gemini-pro"
            }, {
                headers: { 'Content-Type': 'application/json' }
            })

            const id = result.data.id
            let response = null
            let data = true

            while (data) {
                response = await axios.get(`https://nexra.aryahcr.cc/api/chat/task/${encodeURIComponent(id)}`)
                response = response.data

                switch (response.status) {
                    case "pending":
                        data = true
                        break
                    case "completed":
                        data = false
                        res.type('json').send(JSON.stringify({
                            status: "success",
                            message: "Gemini Pro response generated successfully.",
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
    name: "Gemini Pro Model API",
    author: "Jerome",
    description: "A route to interact with the Gemini Pro model by providing a prompt, supporting both streaming and non-streaming modes.",
    category: "AI Interaction",
    link: ["/api/gemini-pro?prompt=hi&stream=false"]
}

export { router, serviceMetadata }
