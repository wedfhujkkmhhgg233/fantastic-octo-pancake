import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

// Service metadata
const serviceMetadata = {
  name: "Wattpad Story Scraper",
  author: "Jerome Jamis",
  description: "Fetches Wattpad story information, including reading chapters, getting story parts, and searching for stories.",
  category: "Books",
  link: [
    "/service/api/wattpad/search?query=example", 
    "/service/api/wattpad/story-parts?url=https://www.wattpad.com/story/example",
    "/service/api/wattpad/read-chapter?url=https://www.wattpad.com/story/example/chapter/example"
  ]
};

// Function to read chapter content
async function readChapter(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const paragraphs = $('p[data-p-id]');
    
    return paragraphs
      .map((_, element) => $(element).text().trim())
      .get()
      .join(' ');
  } catch (error) {
    throw new Error(error.message);
  }
}

// Function to get all parts of a story
async function getStoryParts(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const tableOfContents = $('.table-of-contents .story-parts ul');
    const storyParts = [];

    tableOfContents.find('li').each((_, element) => {
      const $element = $(element);
      const title = $element.find('.part-title').text().trim();
      const link = 'https://www.wattpad.com' + $element.find('a').attr('href');
      storyParts.push({ title, link });
    });

    return storyParts;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Function to search stories on Wattpad
async function searchStories(query) {
  try {
    const response = await axios.get(`https://www.wattpad.com/search/${encodeURIComponent(query)}`);
    const html = response.data;
    const $ = cheerio.load(html);
    const storyCards = $('.story-card');

    return storyCards.map((_, element) => {
      const $element = $(element);
      const title = $element.find('.title').text().trim();
      const link = 'https://www.wattpad.com' + $element.attr('href');
      const description = $element.find('.description').text().trim();
      const thumbnail = $element.find('.cover img').attr('src') || '';
      const stats = $element.find('.new-story-stats .stats-item');
      let reads = '', votes = '', parts = '';

      stats.each((_, stat) => {
        const label = $(stat).find('.stats-label__text').text().trim().toLowerCase();
        const value = $(stat).find('.stats-value').text().trim();
        if (label === 'reads') reads = value;
        if (label === 'votes') votes = value;
        if (label === 'parts') parts = value;
      });

      const author = $element.find('.username').text().trim();
      return { title, author, link, thumbnail, reads, votes, parts, description };
    }).get();
  } catch (error) {
    throw new Error(error.message);
  }
}

// Route to search for stories
router.get('/wattpad/search', async (req, res) => {
  try {
    const { query } = req.query;
    const stories = await searchStories(query);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ success: true, stories }, null, 2));
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    res.status(500).send(JSON.stringify({ error: "Failed to search stories", message: error.message }, null, 2));
  }
});

// Route to get all parts of a story
router.get('/wattpad/story-parts', async (req, res) => {
  try {
    const { url } = req.query;
    const parts = await getStoryParts(url);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ success: true, parts }, null, 2));
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    res.status(500).send(JSON.stringify({ error: "Failed to get story parts", message: error.message }, null, 2));
  }
});

// Route to read a specific chapter
router.get('/wattpad/read-chapter', async (req, res) => {
  try {
    const { url } = req.query;
    const chapterContent = await readChapter(url);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ success: true, chapterContent }, null, 2));
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    res.status(500).send(JSON.stringify({ error: "Failed to read chapter", message: error.message }, null, 2));
  }
});

export { router, serviceMetadata };
