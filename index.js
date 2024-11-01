const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to serve static files from the root directory
app.use(express.static(path.join(__dirname))); // Serve static files from the root directory

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// /config endpoint
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
            return res.status(500).json({ error: 'failed to read package.json' });
        }
        res.json(JSON.parse(data));
    });
});

// /package-lock endpoint to return package-lock.json content
app.get('/package-lock', (req, res) => {
    fs.readFile(path.join(__dirname, 'package-lock.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'failed to read package-lock.json' });
        }
        res.json(JSON.parse(data));
    });
});

// /service-list endpoint to return the service list
app.get('/service-list', (req, res) => {
    const servicesDir = path.join(__dirname, 'services');
    const services = [];

    fs.readdir(servicesDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'failed to read services directory' });
        }

        files.forEach(file => {
            if (path.extname(file) === '.json') {
                const filePath = path.join(servicesDir, file);
                const data = fs.readFileSync(filePath, 'utf8');
                services.push(JSON.parse(data));
            }
        });

        res.json(services);
    });
});

// Route to serve downloader.html
app.get('/service/downloader', (req, res) => {
    res.sendFile(path.join(__dirname, 'downloader.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
