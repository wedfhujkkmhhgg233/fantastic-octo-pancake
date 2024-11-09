import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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
        // Load JSON service metadata
        if (fs.existsSync(servicesDir)) {
            const files = fs.readdirSync(servicesDir);
            files.forEach(file => {
                if (path.extname(file) === '.json') {
                    const filePath = path.join(servicesDir, file);
                    const data = fs.readFileSync(filePath, 'utf8');
                    services.push(JSON.parse(data));
                }
            });
        }

        // Load API metadata from JS files
        if (fs.existsSync(apiDir)) {
            const apiFiles = fs.readdirSync(apiDir);
            for (const file of apiFiles) {
                if (path.extname(file) === '.js') {
                    const module = await import(path.join(apiDir, file).replace(/\.js$/, '.js'));
                    if (module.serviceMetadata) {
                        services.push(module.serviceMetadata);
                    }
                }
            }
        }

        res.json(services);
    } catch (error) {
        console.error("Failed to retrieve service list:", error);
        res.status(500).json({ error: 'Failed to retrieve service list.' });
    }
});

// Load all API routes dynamically from the api directory
const loadApiRoutes = async () => {
    const apiDir = path.join(__dirname, 'api');
    if (fs.existsSync(apiDir)) {
        const files = fs.readdirSync(apiDir);
        for (const file of files) {
            if (path.extname(file) === '.js') {
                const module = await import(path.join(apiDir, file));
                if (module.router) {
                    const routePath = `/service/api/${file.replace('.js', '')}`;
                    app.use(routePath, module.router);
                    console.log(`Loaded route: ${routePath}`);
                } else {
                    console.warn(`No router exported in ${file}`);
                }
            }
        }
    } else {
        console.warn('API directory not found:', apiDir);
    }
};

// Call function to load API routes
loadApiRoutes();

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
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
