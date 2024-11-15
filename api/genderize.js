import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service Metadata
export const serviceMetadata = {
  name: 'Genderize API',
  author: 'Jerome Jamis',
  description: 'Predicts gender based on a name.',
  category: 'Others',
  link: ['/api/genderize?name=<name>'],
};

// Route to fetch gender
router.get('/genderize', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing name parameter. Please provide a name.',
      guide: {
        usage: '/genderize?name=<name>',
        example: '/genderize?name=peter',
      },
    });
  }

  const url = `https://api.genderize.io/?name=${name}`;

  try {
    const response = await axios.get(url);

    // Pretty JSON response
    res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching gender data:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch gender data',
    });
  }
});

export { router };
