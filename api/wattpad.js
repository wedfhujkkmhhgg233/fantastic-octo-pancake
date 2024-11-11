import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

// Service metadata
const serviceMetadata = {
  name: "Wattpad Story Scraper",
  author: "Jerome Jamis",
  description: "Fetches Wattpad story information, including reading chapters, getting story parts, and searching for stories.",
  category: "Search",
  link: ["/api/wattpad?type=search&query=example", "/api/wattpad?type=story-parts&url=https://www.wattpad.com/story/example", "/api/wattpad?type=read-chapter&url=https://www.wattpad.com/story/example/chapter/example"]
};

// Helper functions
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

// Unified Wattpad route
router.get('/wattpad', async (req, res) => {
  const { type, url, query } = req.query;

  try {
    let result;
    switch (type) {
      case 'search':
        if (!query) {
          throw new Error("Query parameter 'query' is required for search.");
        }
        result = await searchStories(query);
        res.status(200).json({ success: true, data: result });
        break;
      
      case 'story-parts':
        if (!url) {
          throw new Error("Query parameter 'url' is required for story-parts.");
        }
        result = await getStoryParts(url);
        res.status(200).json({ success: true, data: result });
        break;
      
      case 'read-chapter':
        if (!url) {
          throw new Error("Query parameter 'url' is required for read-chapter.");
        }
        result = await readChapter(url);
        res.status(200).json({ success: true, data: result });
        break;
      
      default:
        throw new Error("Invalid 'type' parameter. Valid options are 'search', 'story-parts', or 'read-chapter'.");
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export { router, serviceMetadata };
