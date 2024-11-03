const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to serve static files from the root directory
app.use(express.static(path.join(__dirname)));

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
app.get('/service-list', (req, res) => {
    const services = [];
    const servicesDir = path.join(__dirname, 'services');
    const apiDir = path.join(__dirname, 'api');

    // Read services directory for JSON files
    fs.readdir(servicesDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read services directory' });
        }

        files.forEach(file => {
            if (path.extname(file) === '.json') {
                const filePath = path.join(servicesDir, file);
                const data = fs.readFileSync(filePath, 'utf8');
                services.push(JSON.parse(data));
            }
        });

        // Read api directory for API service metadata
        fs.readdir(apiDir, (err, apiFiles) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to read api directory' });
            }

            apiFiles.forEach(file => {
                if (path.extname(file) === '.js') {
                    const { serviceMetadata } = require(path.join(apiDir, file));
                    services.push(serviceMetadata);
                }
            });

            res.json(services);
        });
    });
});

// Load API routes for Bing, Gemini, Lyrics, and Chords services
const bingRouter = require('./api/bing').router;
app.use('/service/api', bingRouter); // Route to access Bing API as /service/api/bing

const geminiRouter = require('./api/gemini').router;
app.use('/service/api', geminiRouter); // Route to access Gemini API as /service/api/gemini

const lyricsRouter = require('./api/lyrics').router; // Add the lyrics router
app.use('/service/api', lyricsRouter); // Route to access Lyrics API as /service/api/lyrics

const chordsRouter = require('./api/chords').router; // Add the chords router
app.use('/service/api', chordsRouter); // Route to access Chords API as /service/api/chords

// Route to serve downloader.html
app.get('/service/downloader', (req, res) => {
    res.sendFile(path.join(__dirname, 'downloader.html'));
});

// Additional service routes
app.get('/service/sim', (req, res) => {
    res.sendFile(path.join(__dirname, 'sim.html'));
});

// 404 Error Handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
