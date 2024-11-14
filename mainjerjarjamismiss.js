// Import necessary modules
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
                    // Dynamically import the JS file and mount the route
                    const module = await import(path.join(apiDir, file).replace(/\.js$/, '.js'));
                    if (module.router) {
                        app.use('/service/api', module.router);  // Mount the route under /service/api
                    }
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

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

