import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import qs from 'qs';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: "Facebook UID Getter",
    description: "Lookup Facebook User ID from a URL, such as a Facebook profile.",
    category: "Search",
    usage: "/api/fb?url=https://www.facebook.com/JeromeExpertise",
    method: "GET"
};

// Facebook UID Lookup Route
router.get('/fb', async (req, res) => {
    const fbUrl = req.query.url;
    const lookupUrl = "https://lookup-id.com";

    if (!fbUrl) {
        return res.status(400).json(JSON.stringify({
            error: 'URL parameter is required'
        }, null, 2));
    }

    try {
        const { data } = await axios.get(lookupUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const $ = cheerio.load(data);
        const formData = {
            fburl: fbUrl,
            check: 'Lookup'
        };

        const response = await axios.post(lookupUrl, qs.stringify(formData), {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const $response = cheerio.load(response.data);
        const codeElement = $response('#code-wrap #code');

        if (codeElement.length > 0) {
            const code = codeElement.text();
            return res.type('json').send(JSON.stringify({ code }, null, 2));
        } else {
            return res.status(404).json(JSON.stringify({
                error: 'Specified element not found.'
            }, null, 2));
        }
    } catch (error) {
        return res.status(500).json(JSON.stringify({
            error: error.message
        }, null, 2));
    }
});

export { router, serviceMetadata };
