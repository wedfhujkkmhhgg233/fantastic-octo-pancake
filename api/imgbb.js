import express from 'express';
import axios from 'axios';
import https from 'https';
import http from 'http';
import FormData from 'form-data';

// Set your Imgbb API key here
const apiKey = 'ec90e468bc3048778fbbbc350eea5d84';  // Your Imgbb API key

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

// Function to upload image to Imgbb
async function uploadImage(imageUrl) {
  try {
    // Download the image
    const imageBuffer = await downloadImage(imageUrl);

    // Create form data
    const form = new FormData();
    form.append('image', imageBuffer, { filename: 'image.jpg' });

    // Make the request to upload the image to Imgbb
    const response = await axios.post('https://api.imgbb.com/1/upload', form, {
      params: {
        key: apiKey,
      },
      headers: {
        ...form.getHeaders(),  // Include form data headers
      },
    });

    // Prepare the response with pretty JSON formatting
    if (response.data.success) {
      return JSON.stringify({
        status: 200,
        message: 'Image uploaded successfully',
        imgUrl: response.data.data.url,  // imgbb returns the URL in `data.url`
      }, null, 2); // Pretty format with 2 spaces
    } else {
      return JSON.stringify({
        status: 500,
        message: 'Image upload failed',
        error: response.data.data.error,
      }, null, 2); // Pretty format with 2 spaces
    }
  } catch (error) {
    return JSON.stringify({
      status: 500,
      message: 'Error uploading image',
      error: error.message,
    }, null, 2); // Pretty format with 2 spaces
  }
}

// ImgUploader Route - Now a GET route
router.get('/upload-imgbbimage', async (req, res) => {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({
      status: 400,
      message: 'No image URL provided',
    });
  }

  const result = await uploadImage(imageUrl);
  
  // Send the prettified JSON response
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(result);
});

// Service Metadata
const serviceMetadata = {
  name: "ImgBB Image Uploader",
  author: "Jerome",
  description: "Uploads an image to Imgbb from a provided URL.",
  category: "Others",
  link: ["/api/upload-imgbbimage?imageUrl="] // Relative link to the endpoint
};

export { router, serviceMetadata };
