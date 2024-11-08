import express from 'express';
import canvas from 'canvas';
import axios from 'axios';
import fs from 'fs-extra';

const router = express.Router();

const wrapText = (ctx, text, maxWidth) => {
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
        resolve(lines);
    });
};

router.get('/zuck', async (req, res) => {
    const text = req.query.text;

    if (!text) {
        return res.status(400).json({
            error: "Please provide text content with the 'text' query parameter."
        });
    }

    try {
        // Load the background image
        const imageUrl = 'https://i.postimg.cc/gJCXgKv4/zucc.jpg';
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const baseImage = await canvas.loadImage(Buffer.from(response.data));

        // Create a canvas
        const canvasImage = canvas.createCanvas(baseImage.width, baseImage.height);
        const ctx = canvasImage.getContext('2d');
        ctx.drawImage(baseImage, 0, 0, canvasImage.width, canvasImage.height);

        // Set font properties
        ctx.font = "400 18px Arial";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "start";
        
        // Adjust font size to fit within the image width
        let fontSize = 50;
        while (ctx.measureText(text).width > 1200) {
            fontSize--;
            ctx.font = `400 ${fontSize}px Arial`;
        }

        // Wrap text and position it on the canvas
        const lines = await wrapText(ctx, text, 470);
        ctx.fillText(lines.join('\n'), 15, 75);

        // Send the processed image as a response
        const buffer = canvasImage.toBuffer();
        fs.writeFileSync('/tmp/zuck.png', buffer);
        res.set('Content-Type', 'image/png');
        res.sendFile('/tmp/zuck.png', () => {
            fs.unlinkSync('/tmp/zuck.png'); // Clean up the temp file
        });

    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({ error: "An error occurred while generating the image." });
    }
});

// Metadata
const serviceMetadata = {
    name: "Zuck Comment",
    author: "Tiadals",
    description: "Adds a comment to an image of Zuckerberg's board.",
    category: "Canvas",
    link: ["/zuck?text=your-text"]
};

export { router, serviceMetadata };
