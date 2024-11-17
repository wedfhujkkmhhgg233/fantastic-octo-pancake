import express from 'express';
import { ImgurClient } from 'imgur';

const router = express.Router();

// Initialize ImgurClient
const client = new ImgurClient({
  clientId: '1d3369d09c344a4', // Replace with your Imgur Client ID
});

// Function to upload image using ImgurClient
async function uploadImageToImgur(imageUrl) {
  try {
    const response = await client.upload({
      image: imageUrl,
      type: 'url',
    });

    return {
      status: 200,
      message: 'Image uploaded successfully',
      imgUrl: response.data.link,
    };
  } catch (error) {
    return {
      status: 500,
      message: 'Error uploading image',
      error: error.message,
    };
  }
}

// Endpoint for uploading image
router.get('/upload-image', async (req, res) => {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({
      status: 400,
      message: 'No image URL provided',
    });
  }

  const result = await uploadImageToImgur(imageUrl);

  // Send the prettified JSON response
  res.status(result.status).json(
    JSON.stringify(result, null, 2) // Prettify JSON with 2 spaces
  );
});

// Service Metadata
const serviceMetadata = {
  name: 'Imgur Image Uploader',
  author: 'Jerome',
  description: 'Uploads an image to Imgur from a provided URL using ImgurClient.',
  category: 'Others',
  link: ["/api/upload-image?imageUrl="] // Relative link to the endpoint
};

export { router, serviceMetadata };
