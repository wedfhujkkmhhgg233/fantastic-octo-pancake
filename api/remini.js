import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/upscale', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            error: "Please provide the 'url' query parameter."
        });
    }

    try {
        const formData = new URLSearchParams();
        formData.append("upscale_factor", "x2");
        formData.append("image_url", url);

        const response = await axios.post('https://api.picsart.io/tools/1.0/upscale', formData.toString(), {
            headers: {
                'accept': 'application/json',
                'x-picsart-api-key': 'eyJraWQiOiI5NzIxYmUzNi1iMjcwLTQ5ZDUtOTc1Ni05ZDU5N2M4NmIwNTEiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhdXRoLXNlcnZpY2UtMTYzZTBkZmYtNmMxZC00NDJkLTgxZTEtYmYzNGIzMTIyMTcxIiwiYXVkIjoiNDY4ODE0OTM3MDE2MTAxIiwibmJmIjoxNzMxMTE4OTg0LCJzY29wZSI6WyJiMmItYXBpLmdlbl9haSIsImIyYi1hcGkuaW1hZ2VfYXBpIl0sImlzcyI6Imh0dHBzOi8vYXBpLnBpY3NhcnQuY29tL3Rva2VuLXNlcnZpY2UiLCJvd25lcklkIjoiNDY4ODE0OTM3MDE2MTAxIiwiaWF0IjoxNzMxMTE4OTg0LCJqdGkiOiI0MWMyYWI4Ny1hZGYyLTQ3ZWQtOWEyMC1hZDBjMThmZTM0YTgifQ.CVAdJRQV4i4CBN32z6jxinUDdWKQww-ZXh3pAnSav4ocQw2727iptULiePvhPaBtlOQ-_5PY-gxglLBIM1wVE2LEXkS__wExfjMt5-uvVkFuEluiaSCUdPUdGHl4AcoDCc0A2mkoi79F2LgNMssvDleBHjUZD08d05umJfwmu7tq6m5ZKPMTjz2GHcOrqm2k3MyIBaFAxEDUKUY-ZjmEb-UJQvK3pgKAvY7YUzwWxsPqfM7mtrn3JJcXOuWL3TaZdrrVoJnKqSs_-dtsJdnucti2txC2H4pC5-Jlx-zkKKI2G-YtPwMXvII5vtE2ihA8Qck5W8qa8hCuJoJdt0ZuXw',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Return the enhanced image URL or data
        res.status(200).json({
            author: "Jerome",
            enhanced_image: response.data
        });

    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ error: "An error occurred while processing the image." });
    }
});

// Route metadata
const serviceMetadata = {
    name: "Image Upscale",
    author: "Jerome",
    description: "Upscales images using Picsart API",
    category: "Image Processing",
    link: ["/upscale?url=<IMAGE_URL>"]
};

export { router, serviceMetadata };
