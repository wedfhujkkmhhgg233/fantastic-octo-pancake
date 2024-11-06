import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of existing MP3 file names
const existingFiles = [
    'jer.mp3',
    'jer1.mp3',
    'jer2.mp3',
    'jer3.mp3',
    'jer4.mp3',
    'jer5.mp3',
    'jer6.mp3',
    'jer7.mp3',
];

// Function to get a random existing file name
const getRandomExistingFileName = () => {
    const randomIndex = Math.floor(Math.random() * existingFiles.length);
    return existingFiles[randomIndex];
};

// Spotify track fetch and download route
router.get('/spotify-download', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        // First API: Get the track URL
        const spotifyApiUrl = `https://spotify-play-iota.vercel.app/spotify?query=${encodeURIComponent(query)}`;
        const trackResponse = await axios.get(spotifyApiUrl);

        if (!trackResponse.data || !trackResponse.data.trackURLs || trackResponse.data.trackURLs.length === 0) {
            throw new Error('Invalid data from the Spotify API');
        }

        const firstTrackUrl = trackResponse.data.trackURLs[0];

        // Second API: Get track details and download URL
        const trackDetailsUrl = `https://joshweb.click/api/spotify2?q=${encodeURIComponent(firstTrackUrl)}`;
        const trackDetails = await axios.get(trackDetailsUrl);

        if (!trackDetails.data || !trackDetails.data.result || !trackDetails.data.result.download_url) {
            throw new Error('Invalid data from the track details API');
        }

        const downloadUrl = trackDetails.data.result.download_url;

        // Select a random existing MP3 file name
        const selectedFileName = getRandomExistingFileName();
        const mp3Path = path.join(__dirname, '..', 'public', selectedFileName);

        // Download the MP3 file
        const response = await axios.get(downloadUrl, { responseType: 'stream' });
        const mp3Stream = fs.createWriteStream(mp3Path);

        response.data.pipe(mp3Stream);

        // Error handling for stream
        mp3Stream.on('error', (err) => {
            console.error('Stream error:', err);
            res.status(500).json({ error: 'Error writing to file' });
        });

        // Set file expiration (if needed)
        setTimeout(() => {
            if (fs.existsSync(mp3Path)) {
                fs.unlinkSync(mp3Path);
            }
        }, 180000); // 3 minutes

        mp3Stream.on('finish', () => {
            const fileUrl = `https://jerome-web.gleeze.com/public/${selectedFileName}`;
            res.json({ downloadUrl: fileUrl });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing Spotify request: ' + error.message });
    }
});

// Service metadata
const serviceMetadata = {
    name: "Spotify Downloader",
    author: "Jerome",
    description: "Downloads Spotify tracks as MP3 files",
    category: "Music",
    link: ["/api/spotify-download?query="]
};

export { router, serviceMetadata };
