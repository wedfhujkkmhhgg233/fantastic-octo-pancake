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
