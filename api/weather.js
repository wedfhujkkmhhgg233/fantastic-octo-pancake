import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/weather', async (req, res) => {
    const { q } = req.query; // Check if a location is provided

    if (!q) {
        // Return an error if no location is specified
        return res.status(400).json({
            error: "Please provide a location with the 'q' query parameter, e.g., /api/weather?q=Manila"
        });
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=b2a8b8594b90db094962f25e7fc67082&units=metric&lang=Tagalog`;

    try {
        const response = await axios.get(apiUrl);
        const weatherData = response.data;

        // Send response with pretty-printed JSON
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(weatherData, null, 2)); // Pretty-print with 2-space indentation

    } catch (error) {
        console.error("Error fetching weather data:", error);
        res.status(500).json({ error: "An error occurred while fetching weather data." });
    }
});

// Route metadata
const serviceMetadata = {
    name: "Weather",
    author: "Jerome Jamis",
    description: "Fetches and displays current weather for a specified location",
    category: "Others",
    link: ["/api/weather?q=Manila"]
};

export { router, serviceMetadata };
