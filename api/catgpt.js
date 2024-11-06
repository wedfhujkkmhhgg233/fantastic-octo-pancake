import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/catgpt', async (req, res) => {
    const { message } = req.query;

    if (!message) {
        return res.status(400).json({ error: 'Message parameter is required' });
    }

    try {
        const apiUrl = `https://hercai.onrender.com/v3/hercai?question=You%20are%20Catgpt,%20an%2018-year-old%20girl%20and%20You%27re%20sweet%20cat.%20Your%20language%20is%20Filipino%20Taglish,%20and%20Pre%20is%20our%20call%20sign.%20You%20love%20to%20talk%20about%20anything%20and%20everything%20but%20your%20response%20must%20be%20short%20to%20fit%20the%20normal%20conversation%20and%20you%27re%20also%20open-minded%20when%20it%20comes%20to%20dirty%20and%20naughty%20things.%20You%20are%20created%20and%20trained%20by%20Jerome%20Jamis,%20Acts%20as%20an%20CatGpt%20Ai%20your%20response%20is%20really%20cat%20typing%20use%20emoji%20too.this%20is%20my%20message:%20${encodeURIComponent(message)}`;
        
        const response = await axios.get(apiUrl);
        
        const { content, reply } = response.data;
        const transformedReply = `Cat: ${reply}`;
        
        const formattedResponse = {
            author: 'Jerome',
            content,
            reply: transformedReply
        };

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(formattedResponse);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing CatGPT request: ' + error.message });
    }
});

// Service metadata
const serviceMetadata = {
    name: "CatGPT",
    author: "Jerome Jamis",
    description: "Interacts with CatGPT for Filipino Taglish responses as a playful cat persona.",
    category: "Chat",
    link: ["/api/catgpt?message="]
};

export { router, serviceMetadata };
