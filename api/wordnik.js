import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

// Helper function to extract content based on the structure you've provided
const scrapeWordnik = async (word) => {
  const url = `https://www.wordnik.com/words/${word}`;

  try {
    // Fetch the HTML of the word page
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const result = {
      word: word,
      definitions: [],
      etymologies: [],
      examples: [],
      relatedWords: [],
      equivalents: [],
      hypernyms: [],
      sameContext: [],
      variants: [],
      forms: [],
      crossReferences: [],
      rhymes: []
    };

    // Scrape Definitions
    $('.word-module.module-definitions').each((i, module) => {
      const source = $(module).find('.source').text().trim();
      const definitions = [];

      $(module).find('ul li').each((j, li) => {
        const partOfSpeech = $(li).find('abbr').attr('title');
        const definitionText = $(li).text().replace(partOfSpeech, '').trim();
        definitions.push({ partOfSpeech, definition: definitionText });
      });

      if (definitions.length > 0) {
        result.definitions.push({ source, definitions });
      }
    });

    // Scrape Etymologies
    $('.word-module.module-etymologies').each((i, module) => {
      const etymology = $(module).find('.guts').text().trim();
      if (etymology) {
        result.etymologies.push(etymology);
      }
    });

    // Scrape Examples
    $('.word-module.module-examples').each((i, module) => {
      const examples = [];
      $(module).find('.examples li').each((j, li) => {
        const text = $(li).find('.text').text().trim();
        const source = $(li).find('.source a').attr('href');
        examples.push({ text, source });
      });

      if (examples.length > 0) {
        result.examples = examples;
      }
    });

    // Scrape Related Words
    $('.word-module.module.related_words').each((i, module) => {
      const relatedWords = [];
      $(module).find('.related-group.synonym ol li').each((j, li) => {
        const relatedWord = $(li).find('a').text().trim();
        relatedWords.push(relatedWord);
      });

      if (relatedWords.length > 0) {
        result.relatedWords = relatedWords;
      }
    });

    // Scrape Equivalents
    $('.word-module.module.equivalents').each((i, module) => {
      const equivalents = [];
      $(module).find('.related-group.equivalent ol li').each((j, li) => {
        const equivalent = $(li).find('a').text().trim();
        equivalents.push(equivalent);
      });

      if (equivalents.length > 0) {
        result.equivalents = equivalents;
      }
    });

    // Scrape Hypernyms
    $('.word-module.module.hypernym').each((i, module) => {
      const hypernyms = [];
      $(module).find('.related-group.hypernym ol li').each((j, li) => {
        const hypernym = $(li).find('a').text().trim();
        hypernyms.push(hypernym);
      });

      if (hypernyms.length > 0) {
        result.hypernyms = hypernyms;
      }
    });

    // Scrape Same Context Words
    $('.word-module.module.same-context').each((i, module) => {
      const sameContextWords = [];
      $(module).find('.related-group.same-context ol li').each((j, li) => {
        const sameContext = $(li).find('a').text().trim();
        sameContextWords.push(sameContext);
      });

      if (sameContextWords.length > 0) {
        result.sameContext = sameContextWords;
      }
    });

    // Scrape Variants
    $('.word-module.module.variants').each((i, module) => {
      const variants = [];
      $(module).find('.related-group.variants ol li').each((j, li) => {
        const variant = $(li).find('a').text().trim();
        variants.push(variant);
      });

      if (variants.length > 0) {
        result.variants = variants;
      }
    });

    // Scrape Forms
    $('.word-module.module.forms').each((i, module) => {
      const forms = [];
      $(module).find('.related-group.forms ol li').each((j, li) => {
        const form = $(li).find('a').text().trim();
        forms.push(form);
      });

      if (forms.length > 0) {
        result.forms = forms;
      }
    });

    // Scrape Cross-references
    $('.word-module.module.rhyme').each((i, module) => {
      const crossReferences = [];
      $(module).find('.related-group.rhyme ol li').each((j, li) => {
        const crossReference = $(li).find('a').text().trim();
        crossReferences.push(crossReference);
      });

      if (crossReferences.length > 0) {
        result.crossReferences = crossReferences;
      }
    });

    // Scrape Rhymes
    $('.word-module.module.rhyme').each((i, module) => {
      const rhymes = [];
      $(module).find('.related-group.rhyme ol li').each((j, li) => {
        const rhyme = $(li).find('a').text().trim();
        rhymes.push(rhyme);
      });

      if (rhymes.length > 0) {
        result.rhymes = rhymes;
      }
    });

    return result;

  } catch (error) {
    console.error("Error scraping Wordnik:", error);
    throw new Error("Could not scrape Wordnik data.");
  }
};

// Route for scraping Wordnik
router.get('/wordnik-scrape', async (req, res) => {
  const { word } = req.query;

  if (!word) {
    return res.status(400).json({ error: "Word query parameter is required" });
  }

  try {
    const scrapedData = await scrapeWordnik(word);
    // Pretty print the JSON response
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(scrapedData, null, 2)); // Pretty print with 2 spaces indentation
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Metadata for the route
const serviceMetadata = {
  name: 'Wordnik Scraper',
  description: 'This service scrapes Wordnik to get information like definitions, etymologies, examples, and more for a given word.',
  category: 'Search',
  author: 'Jerome Jamis',
  link: ["/api/wordnik-scrape?word=<your-word-here>"]
};

// Exporting the router and service metadata
export { router, serviceMetadata };
