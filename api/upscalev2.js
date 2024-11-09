import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/upscalev2', async (req, res) => {
    const { imgurl } = req.query;

    if (!imgurl) {
        return res.status(400).json({
            error: "Please provide the 'imgurl' query parameter."
        });
    }

    try {
        // Prepare form data for the request
        const formData = `-----011000010111000001101001\r\nContent-Disposition: form-data; name="image"\r\n\r\n${imgurl}\r\n-----011000010111000001101001--\r\n`;

        // Send request to RapidAPI AI image upscaling service
        const response = await axios.post('https://ai-image-upscaler1.p.rapidapi.com/v1', formData, {
            headers: {
                'x-rapidapi-key': 'fb9b4c19c8msh9d206a87805e016p1c3debjsnfc15481f4f3b',
                'x-rapidapi-host': 'ai-image-upscaler1.p.rapidapi.com',
                'Content-Type': 'multipart/form-data; boundary=---011000010111000001101001'
            }
        });

        // Get the result_base64 field from the API response
        const base64Image = response.data.result_base64;

        if (!base64Image) {
            return res.status(500).json({ error: "No result found in the response." });
        }

        // Determine the image format (you can change this logic if the API provides different formats)
        let mimeType = 'image/png'; // Default to PNG

        if (base64Image.startsWith('iVBORw0KGgo')) {
            mimeType = 'image/png'; // PNG format
        } else if (base64Image.startsWith('/9j/')) {
            mimeType = 'image/jpeg'; // JPEG format
        } else if (base64Image.startsWith('R0lGODlh')) {
            mimeType = 'image/gif'; // GIF format
        }

        // Convert base64 to image buffer
        const buffer = Buffer.from(base64Image, 'base64');

        // Set the response header to send the correct image format
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', buffer.length);

        // Send the image buffer directly in the response
        res.send(buffer);

    } catch (error) {
        console.error("Error upscaling the image:", error);
        res.status(500).json({ error: "An error occurred while upscaling the image." });
    }
});

// Route metadata
const serviceMetadata = {
    name: "AI Image Upscaler v2",
    author: "Jerome",
    description: "Upscales an image using the AI Image Upscaler API and sends the upscaled image directly as a response.",
    category: "Image Processing",
    link: ["/upscalev2?imgurl="]
};

export { router, serviceMetadata };
