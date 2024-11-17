import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { router as aiRouter } from './api/ai.js'; // Import AI router with .js extension

const app = express();
const port = process.env.PORT || 3000;

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to serve static files from the root directory
app.use(express.static(__dirname));

// Middleware to parse JSON bodies
app.use(express.json());

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// /config endpoint to provide configuration details
app.get('/config', (req, res) => {
    const configResponse = {
        port: "3000",
        name: "Jer Web",
        name2: "Jerome Jamis",
        description: "profile",
        email: "jeromejamis55@gmail.com",
        number: "n/a",
        birthday: "2010-04-25",
        birthday2: "April 25, 2010",
        location: "El Salvador City, Philippines",
        facebook: "https://www.facebook.com/jeromeexpertise",
        github: "https://github.com/wedfhujkkmhhgg233/",
        twitter: "https://simsimi.ooguy.com/",
        linkedin: "N/a"
    };
    res.json(configResponse);
});

// /package endpoint to return package.json content
app.get('/package', (req, res) => {
    fs.readFile(path.join(__dirname, 'package.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read package.json' });
        }
        res.json(JSON.parse(data));
    });
});

// /package-lock endpoint to return package-lock.json content
app.get('/package-lock', (req, res) => {
    fs.readFile(path.join(__dirname, 'package-lock.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read package-lock.json' });
        }
        res.json(JSON.parse(data));
    });
});

// /service-list endpoint to combine and return all service metadata
app.get('/service-list', async (req, res) => {
    const services = [];
    const servicesDir = path.join(__dirname, 'services');
    const apiDir = path.join(__dirname, 'api');

    try {
        // Read services directory for JSON files
        if (fs.existsSync(servicesDir)) {
            const files = fs.readdirSync(servicesDir);
            files.forEach(file => {
                if (path.extname(file) === '.json') {
                    const filePath = path.join(servicesDir, file);
                    const data = fs.readFileSync(filePath, 'utf8');
                    services.push(JSON.parse(data));
                }
            });
        } else {
            console.warn('Services directory not found:', servicesDir);
        }

        // Read api directory for API service metadata
        if (fs.existsSync(apiDir)) {
            const apiFiles = fs.readdirSync(apiDir);
            for (const file of apiFiles) {
                if (path.extname(file) === '.js') {
                    // Dynamically import the JS file
                    const module = await import(path.join(apiDir, file).replace(/\.js$/, '.js'));
                    if (module.serviceMetadata) {
                        services.push(module.serviceMetadata); // Add the service metadata to the list
                    } else {
                        console.warn(`No service metadata found in ${file}`);
                    }
                }
            }
        } else {
            console.warn('API directory not found:', apiDir);
        }

        res.json(services);
    } catch (error) {
        console.error("Failed to retrieve service list:", error);
        res.status(500).json({ error: 'Failed to retrieve service list.' });
    }
});

// Load API routes for various services with .js extension
import { router as bingRouter } from './api/bing.js';
app.use('/service/api', bingRouter);

import { router as dogfactRouter } from './api/dogfact.js';
app.use('/service/api', dogfactRouter);

import { router as catfactRouter } from './api/catfact.js';
app.use('/service/api', catfactRouter);

import { router as dogimageRouter } from './api/dogimage.js';
app.use('/service/api', dogimageRouter);

import { router as catimageRouter } from './api/catimage.js';
app.use('/service/api', catimageRouter);

import { router as bibleRouter } from './api/bible.js';
app.use('/service/api', bibleRouter);

import { router as puppeteerRouter } from './api/screenshot.js';
app.use('/service/api', puppeteerRouter);

import { router as emojiRouter } from './api/emoji.js';
app.use('/service/api', emojiRouter);

import { router as genderizeRouter } from './api/genderize.js';
app.use('/service/api', genderizeRouter);

import { router as newsRouter } from './api/news.js';
app.use('/service/api', newsRouter);

import { router as emailRouter } from './api/email.js';
app.use('/service/api', emailRouter);

import { router as trumpRouter } from './api/trump.js';
app.use('/service/api', trumpRouter);

import { router as mathRouter } from './api/math.js';
app.use('/service/api', mathRouter);

import { router as pdfRouter } from './api/pdf.js';
app.use('/service/api', pdfRouter);

import { router as animeRouter } from './api/anime.js';
app.use('/service/api', animeRouter);

import { router as poliRouter } from './api/poli.js';
app.use('/service/api', poliRouter);

import { router as ageRouter } from './api/age.js';
app.use('/service/api', ageRouter);

import { router as uidRouter } from './api/uid.js';
app.use('/service/api', uidRouter);

import { router as prodiav2Router } from './api/prodiav2.js';
app.use('/service/api', prodiav2Router);

import { router as waifuRouter } from './api/waifu.js';
app.use('/service/api', waifuRouter);

import { router as dictionaryRouter } from './api/dictionary.js';
app.use('/service/api', dictionaryRouter);

import { router as memeRouter } from './api/meme.js';
app.use('/service/api', memeRouter);

import { router as whoaRouter } from './api/whoa.js';
app.use('/service/api', whoaRouter);

import { router as jokeRouter } from './api/joke.js';
app.use('/service/api', jokeRouter);

import { router as factRouter } from './api/fact.js';
app.use('/service/api', factRouter);

import { router as mealRouter } from './api/meal.js';
app.use('/service/api', mealRouter);

import { router as youtubesearchRouter } from './api/youtubesearch.js';
app.use('/service/api', youtubesearchRouter);

import { router as movieinfov1Router } from './api/movieinfov1.js';
app.use('/service/api', movieinfov1Router);

import { router as movieinfov2Router } from './api/movieinfov2.js';
app.use('/service/api', movieinfov2Router);

import { router as movieinfov3Router } from './api/movieinfov3.js';
app.use('/service/api', movieinfov3Router);

import { router as nekoRouter } from './api/neko.js';
app.use('/service/api', nekoRouter);

import { router as wattpadRouter } from './api/wattpad.js';
app.use('/service/api', wattpadRouter);

import { router as insultRouter } from './api/insult.js';
app.use('/service/api', insultRouter);

import { router as itunesRouter } from './api/itunes.js';
app.use('/service/api', itunesRouter);

import { router as gpt4oRouter } from './api/gpt4o.js';
app.use('/service/api', gpt4oRouter);

import { router as dalleminiRouter } from './api/dallemini.js';
app.use('/service/api', dalleminiRouter);

import { router as dalleRouter } from './api/dalle.js';
app.use('/service/api', dalleRouter);

import { router as emiRouter } from './api/emi.js';
app.use('/service/api', emiRouter);

import { router as sdxlRouter } from './api/sdxl.js';
app.use('/service/api', sdxlRouter);

import { router as midjourneyRouter } from './api/midjourney.js';
app.use('/service/api', midjourneyRouter);

import { router as fluxRouter } from './api/flux.js';
app.use('/service/api', fluxRouter);

import { router as geminiproRouter } from './api/geminipro.js';
app.use('/service/api', geminiproRouter);

import { router as llamaRouter } from './api/llama.js';
app.use('/service/api', llamaRouter);

import { router as nkirisearchRouter } from './api/nkirisearch.js';
app.use('/service/api', nkirisearchRouter);

import { router as ytssearchRouter } from './api/ytssearch.js';
app.use('/service/api', ytssearchRouter);

import { router as peakpxRouter } from './api/peakpx.js';
app.use('/service/api', peakpxRouter);

import { router as prodiaRouter } from './api/prodia.js';
app.use('/service/api', prodiaRouter);

import { router as removebgv2Router } from './api/removebgv2.js';
app.use('/service/api', removebgv2Router);

import { router as removebgRouter } from './api/removebg.js';
app.use('/service/api', removebgRouter);

import { router as wantedRouter } from './api/wanted.js';
app.use('/service/api', wantedRouter);

import { router as weatherRouter } from './api/weather.js';
app.use('/service/api', weatherRouter);

import { router as xavierRouter } from './api/xavier.js';
app.use('/service/api', xavierRouter);

import { router as yesRouter } from './api/yes.js';
app.use('/service/api', yesRouter);

import { router as zuckRouter } from './api/zuck.js';
app.use('/service/api', zuckRouter);

import { router as reminiRouter } from './api/remini.js';
app.use('/service/api', reminiRouter);

import { router as poetryRouter } from './api/poetry.js';
app.use('/service/api', poetryRouter);

import { router as ericRouter } from './api/eric.js';
app.use('/service/api', ericRouter);

import { router as brainRouter } from './api/brain.js';
app.use('/service/api', brainRouter);

import { router as catgptRouter } from './api/catgpt.js';
app.use('/service/api', catgptRouter);

import { router as arxivRouter } from './api/arxiv.js';
app.use('/service/api', arxivRouter);

import { router as numbersRouter } from './api/numbers.js';
app.use('/service/api', numbersRouter);

import { router as caseRouter } from './api/case.js';
app.use('/service/api', caseRouter);

import { router as citizendiumRouter } from './api/citizendium.js';
app.use('/service/api', citizendiumRouter);

import { router as wikihowRouter } from './api/wikihow.js';
app.use('/service/api', wikihowRouter);

import { router as wiktionaryRouter } from './api/wiktionary.js';
app.use('/service/api', wiktionaryRouter);

import { router as gimageRouter } from './api/gimage.js';
app.use('/service/api', gimageRouter);

import { router as playstoreRouter } from './api/playstore.js';
app.use('/service/api', playstoreRouter);

import { router as spotifyRouter } from './api/spotify.js';
app.use('/service/api', spotifyRouter);

import { router as lyricsRouter } from './api/lyrics.js';
app.use('/service/api', lyricsRouter);

import { router as chordsRouter } from './api/chords.js';
app.use('/service/api', chordsRouter);

import { router as merriamRouter } from './api/merriam.js';
app.use('/service/api', merriamRouter);

import { router as wordnikRouter } from './api/wordnik.js';
app.use('/service/api', wordnikRouter);

import { router as searchRouter } from './api/search.js';
app.use('/service/api', searchRouter);

import { router as geminiRouter } from './api/gemini.js';
app.use('/service/api', geminiRouter);

import { router as alldlRouter } from './api/alldl.js';
app.use('/service/api', alldlRouter);

app.use('/service/api', aiRouter);

// Route to serve downloader.html
app.get('/downloader', (req, res) => {
    res.sendFile(path.join(__dirname, 'downloader.html'));
});

// Route to serve dashboard.html
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Additional service routes
app.get('/sim', (req, res) => {
    res.sendFile(path.join(__dirname, 'sim.html'));
});

// 404 error handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html')); // Assuming you have a 404.html file
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
