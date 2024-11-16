import express from 'express';
import captureWebsite from 'capture-website';

const router = express.Router();

// Service Metadata
const serviceMetadata = {
    name: "Website Screenshot",
    author: "Jerome",
    description: "Capture a screenshot of a website.",
    category: "Others",
    link: ["/api/screenshot?url="] // Relative link to the endpoint
};

// Screenshot Route
router.get('/screenshot', async (req, res) => {
    const url = req.query.url; // URL to capture

    if (!url) {
        return res.status(400).send({
            status: 400,
            message: "Error: No URL provided. Please include the 'url' query parameter.",
        });
    }

    try {
        // Define the file path for the screenshot
        const screenshotPath = `screenshot.png`; // Save in the current directory

        // Capture the screenshot
        await captureWebsite.file(url, screenshotPath, {
            width: 1280, // Width of the viewport
            height: 720, // Height of the viewport
            fullPage: true, // Capture the full page
            overwrite: true, // Overwrite the file if it exists
        });

        // Send the screenshot as a response
        res.sendFile(screenshotPath, (err) => {
            if (err) {
                res.status(500).send({
                    status: 500,
                    message: "Error sending the screenshot.",
                });
            }
        });
    } catch (error) {
        res.status(500).send({
            status: 500,
            message: "Error capturing screenshot: " + error.message,
        });
    }
});

export { router, serviceMetadata };
