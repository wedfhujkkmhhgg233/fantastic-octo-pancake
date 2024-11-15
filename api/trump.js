import express from 'express';
import axios from 'axios';
import fs from 'fs-extra';
import canvas from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Service Metadata
export const serviceMetadata = {
  name: "Trump1 Image Generator",
  version: "1.0.1",
  author: "ZiaRein",
  description: "Generates a Trump-themed image with custom text",
  category: "edit-img",
  link: ["/api/trump1?text=<your-text>"],
};

// Wrap Text Function
export const wrapText = (ctx, text, maxWidth) => {
  return new Promise(resolve => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    if (ctx.measureText('W').width > maxWidth) return resolve(null);
    const words = text.split(' ');
    const lines = [];
    let line = '';
    while (words.length > 0) {
      let split = false;
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
        else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }
      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
      else {
        lines.push(line.trim());
        line = '';
      }
      if (words.length === 0) lines.push(line.trim());
    }
    return resolve(lines);
  });
};

// Run Function to Generate Image
export const generateTrumpImage = async (text) => {
  const pathImg = path.resolve(__dirname, 'cache', 'trump1.png');

  // Fetch background image
  const imageResponse = await axios.get(`https://i.ibb.co/7Y5jLWq/ZtWfHHx.png`, { responseType: 'arraybuffer' });
  fs.writeFileSync(pathImg, Buffer.from(imageResponse.data, 'utf-8'));

  // Set up canvas and draw text
  const baseImage = await canvas.loadImage(pathImg);
  const canvasObj = canvas.createCanvas(baseImage.width, baseImage.height);
  const ctx = canvasObj.getContext("2d");
  ctx.drawImage(baseImage, 0, 0, canvasObj.width, canvasObj.height);
  ctx.font = "400 45px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "start";

  let fontSize = 250;
  while (ctx.measureText(text).width > 1300) {
    fontSize--;
    ctx.font = `400 ${fontSize}px Arial, sans-serif`;
  }

  const lines = await wrapText(ctx, text, 650);
  ctx.fillText(lines.join('\n'), 60, 165);
  ctx.beginPath();

  // Save and return image buffer
  const imageBuffer = canvasObj.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);
  return pathImg;
};

// GET route for Trump Image Generator
router.get('/trump1', async (req, res) => {
  const text = req.query.text || "Default text";
  try {
    const imagePath = await generateTrumpImage(text);
    res.setHeader('Content-Type', 'image/png');
    res.sendFile(imagePath, () => fs.unlinkSync(imagePath)); // Clean up after sending
  } catch (error) {
    res.status(500).send("Failed to generate image.");
  }
});

// Export router and serviceMetadata
export { router };
