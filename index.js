const express = require('express');
const path = require('path');
const fs = require('fs');
const aiRouter = require('./api/ai').router; // Import AI router
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

// Load API routes for Bing, Gemini, Alldl, and AI services
const bingRouter = require('./api/bing').router;
app.use('/service/api', bingRouter); // Route to access Bing API as /service/api/bing

const spotifyRouter = require('./api/spotify').router;
app.use('/service/api', spotifyRouter);

const lyricsRouter = require('./api/lyrics').router;
app.use('/service/api', lyricsRouter);

const chordsRouter = require('./api/chords').router;
app.use('/service/api', chordsRouter);

const geminiRouter = require('./api/gemini').router;
app.use('/service/api', geminiRouter); // Route to access Gemini API as /service/api/gemini

const alldlRouter = require('./api/alldl').router;
app.use('/service/api', alldlRouter); // Route to access Alldl API as /service/api/alldl

app.use('/service/api', aiRouter); // Route to access AI API as /service/api/ai

// Route to serve downloader.html
app.get('/downloader', (req, res) => {
    res.sendFile(path.join(__dirname, 'downloader.html'));
});

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
