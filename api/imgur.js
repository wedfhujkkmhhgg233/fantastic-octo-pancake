import express from 'express';
import axios from 'axios';
import https from 'https';
import http from 'http';
import FormData from 'form-data';

// Set your Imgur client ID here
const clientId = '1d3369d09c344a4';  // Replace with your actual Client ID

const router = express.Router();

// Function to download image from URL
async function downloadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const client = imageUrl.startsWith('https') ? https : http;
    client.get(imageUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error('Failed to download image.'));
        return;
      }
      const data = [];
      response.on('data', chunk => data.push(chunk));
      response.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', (err) => reject(err));
  });
}

// Function to upload image to Imgur
async function uploadImage(imageUrl) {
  try {
    // Download the image
    const imageBuffer = await downloadImage(imageUrl);

    // Create form data
    const form = new FormData();
    form.append('image', imageBuffer, { filename: 'image.jpg' });

    // Make the request to upload the image to Imgur
    const response = await axios.post('https://api.imgur.com/3/image', form, {
      headers: {
        'Authorization': `Client-ID ${clientId}`,
        ...form.getHeaders(),  // Include form data headers
      },
    });

    // Return the Imgur link in the response
    if (response.data.success) {
      return {
        status: 200,
        message: 'Image uploaded successfully',
        imgUrl: response.data.data.link,
      };
    } else {
      return {
        status: 500,
        message: 'Image upload failed',
        error: response.data.data.error,
      };
    }
  } catch (error) {
    return {
      status: 500,
      message: 'Error uploading image',
      error: error.message,
    };
  }
}

// ImgUploader Route - Now a GET route
router.get('/upload-image', async (req, res) => {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({
      status: 400,
      message: 'No image URL provided',
    });
  }

  const result = await uploadImage(imageUrl);
  
  // Send response with the result of the upload
  res.status(result.status).json(result);
});

// Service Metadata
const serviceMetadata = {
  name: "Imgur Image Uploader",
  author: "Jerome",
  description: "Uploads an image to Imgur from a provided URL.",
  category: "Others",
  link: ["/api/upload-image?imageUrl="] // Relative link to the endpoint
};

export { router, serviceMetadata };
