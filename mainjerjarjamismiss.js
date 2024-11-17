import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Create an Express app instance
const app = express();
const port = process.env.PORT || 3000;

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to serve static files
app.use(express.static(__dirname));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// /service-list endpoint to load JSON and API metadata
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
        }

        // Read api directory for JS files and dynamically import
        if (fs.existsSync(apiDir)) {
            const apiFiles = fs.readdirSync(apiDir);
            for (const file of apiFiles) {
                if (path.extname(file) === '.js') {
                    const module = await import(path.join(apiDir, file));
                    if (module.serviceMetadata) {
                        services.push(module.serviceMetadata); // Add service metadata
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

// Dynamically load all API routers from the 'api' directory
const apiDir = path.join(__dirname, 'api');
fs.readdirSync(apiDir).forEach(file => {
    if (path.extname(file) === '.js') {
        import(path.join(apiDir, file)).then(module => {
            app.use(`/service/api`, module.router);
        }).catch(err => console.error(`Error importing ${file}:`, err));
    }
});

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
    console.log(`Server running on port ${port}`);
});
