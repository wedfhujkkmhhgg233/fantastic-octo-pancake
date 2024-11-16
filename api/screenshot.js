import express from 'express';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Service Metadata
const serviceMetadata = {
  name: 'Screenshot Web',
  author: 'Jerome',
  description: 'Capture a screenshot of a URL.',
  category: 'Others',
  link: '/api/screenshot?url=',
};

// Screenshot Route
router.get('/screenshot', async (req, res) => {
  const url = req.query.url; // URL passed as a query parameter
  if (!url) {
    return res.status(400).send('Error: No URL provided.');
  }

  try {
    // Launch Puppeteer browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Open the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Define screenshot file path
    const screenshotPath = path.resolve('screenshot.png');

    // Take screenshot
    await page.screenshot({ path: screenshotPath });

    // Close browser
    await browser.close();

    // Send screenshot as response
    res.sendFile(screenshotPath, (err) => {
      if (err) {
        res.status(500).send('Error sending screenshot.');
      } else {
        // Optionally delete the screenshot after sending
        fs.unlinkSync(screenshotPath);
      }
    });
  } catch (error) {
    res.status(500).send('Error capturing screenshot: ' + error.message);
  }
});

export { router, serviceMetadata };
