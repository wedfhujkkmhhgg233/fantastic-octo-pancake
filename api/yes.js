import express from 'express';
import axios from 'axios';
import fs from 'fs-extra';
import canvas from 'canvas';

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
        return resolve(lines);
    });
};

router.get('/yes', async (req, res) => {
    const text = req.query.text;
    if (!text) {
        return res.status(400).json({ error: "Please provide text with the 'text' query parameter." });
    }

    const pathImg = './cache/yes.png';

    try {
        const imageResponse = await axios.get('https://i.ibb.co/GQbRhkY/Picsart-22-08-14-17-32-11-488.jpg', { responseType: 'arraybuffer' });
        fs.writeFileSync(pathImg, Buffer.from(imageResponse.data, 'utf-8'));

        const baseImage = await canvas.loadImage(pathImg);
        const myCanvas = canvas.createCanvas(baseImage.width, baseImage.height);
        const ctx = myCanvas.getContext('2d');

        ctx.drawImage(baseImage, 0, 0, myCanvas.width, myCanvas.height);
        ctx.font = "bold 35px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "start";

        const lines = await wrapText(ctx, text, 350);
        ctx.fillText(lines.join('\n'), 280, 50);

        const imageBuffer = myCanvas.toBuffer();
        fs.writeFileSync(pathImg, imageBuffer);

        res.status(200).sendFile(pathImg, () => {
            fs.unlinkSync(pathImg);
        });

    } catch (error) {
        console.error("Error creating image:", error);
        res.status(500).json({ error: "An error occurred while processing the image." });
    }
});

// Route metadata
const serviceMetadata = {
    name: "Yes",
    author: "Jerome",
    description: "Adds a comment on a meme-style image",
    category: "Canvas",
    link: ["/yes?text=<YOUR_TEXT>"]
};

export { router, serviceMetadata };
