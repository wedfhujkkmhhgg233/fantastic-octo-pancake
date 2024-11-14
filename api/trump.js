import express from 'express';
import axios from 'axios';
import fs from 'fs-extra';
import canvas from 'canvas';

const router = express.Router();

// Service Metadata
export const serviceMetadata = {
  name: 'Trump Image Generator',
  author: 'ZiaRein',
  description: 'Generates a Trump-themed image with custom text.',
  category: 'Canvas',
  link: ['/api/trump?text=<your-text>'],
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

// Run Function
export const run = async function (req, res) {
  let pathImg = __dirname + '/cache/trump1.png';
  const { text } = req.query;

  if (!text) {
    return res.status(400).send('Please provide text in the query parameter');
  }

  let imageData = (await axios.get(`https://i.ibb.co/7Y5jLWq/ZtWfHHx.png`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(pathImg, Buffer.from(imageData, 'utf-8'));
  let baseImage = await canvas.loadImage(pathImg);
  let canvasObj = canvas.createCanvas(baseImage.width, baseImage.height);
  let ctx = canvasObj.getContext("2d");
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
  const imageBuffer = canvasObj.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);

  res.setHeader('Content-Type', 'image/png');
  res.send(imageBuffer);

  // Clean up by deleting the image file
  fs.unlinkSync(pathImg);
};

// Define the route
router.get('/trump', run);

// Export router and serviceMetadata
export { router };
