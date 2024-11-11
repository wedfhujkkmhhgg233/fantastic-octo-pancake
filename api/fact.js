import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: 'Random Facts',
    author: 'Jerome Jamis',
    description: 'Fetches random facts.',
    category: 'Others',
    link: ["/api/random-facts"]
};

// Random Facts Route
router.get('/random-facts', async (req, res) => {
    try {
        // Make API request to Useless Facts API
        const response = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random');
        
        if (response.data && response.data.text) {
            const formattedResponse = JSON.stringify({
                success: true,
                message: "Random fact fetched successfully",
                data: {
                    fact: response.data.text
                }
            }, null, 2);

            res.type('json').send(formattedResponse);
        } else {
            res.status(404).json({
                success: false,
                message: "No fact found. Please try again later."
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch data from Useless Facts API",
            error: error.message
        });
    }
});

export { router, serviceMetadata };
