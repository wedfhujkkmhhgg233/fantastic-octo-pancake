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
        // Step 1: Search for tracks using the provided API
        const searchUrl = `https://api.kenliejugarap.com/spotify-search/?title=${encodeURIComponent(query)}`;
        const searchResponse = await axios.get(searchUrl);

        if (!searchResponse.data || !searchResponse.data.response || searchResponse.data.response.length === 0) {
            throw new Error('No tracks found');
        }

        const firstTrack = searchResponse.data.response[0];
        const firstTrackUrl = firstTrack.url;

        // Step 2: Get the download URL for the first track
        const downloadUrlApi = `https://ccprojectapis.ddns.net/api/spotifydl?url=${encodeURIComponent(firstTrackUrl)}`;
        const downloadResponse = await axios.get(downloadUrlApi);

        if (!downloadResponse.data || !downloadResponse.data.download || !downloadResponse.data.download.file_url) {
            throw new Error('Download URL not found');
        }

        const downloadUrl = downloadResponse.data.download.file_url;

        // Step 3: Select a random existing MP3 file name
        const selectedFileName = getRandomExistingFileName();
        const mp3Path = path.join(__dirname, '..', 'public', selectedFileName);

        // Step 4: Download the MP3 file
        const response = await axios.get(downloadUrl, { responseType: 'stream' });
        const mp3Stream = fs.createWriteStream(mp3Path);

        response.data.pipe(mp3Stream);

        // Error handling for stream
        mp3Stream.on('error', (err) => {
            console.error('Stream error:', err);
            res.status(500).json({ error: 'Error writing to file' });
        });

        // Set file expiration
        setTimeout(() => {
            if (fs.existsSync(mp3Path)) {
                fs.unlinkSync(mp3Path);
            }
        }, 180000); // 3 minutes

        mp3Stream.on('finish', () => {
            const fileUrl = `https://jerome-web.gleeze.com/public/${selectedFileName}`;
            res.json({
                metadata: {
                    album: firstTrack.artist_album,
                    album_artist: firstTrack.artist,
                    artist: firstTrack.artist,
                    track_name: firstTrack.title,
                    release_date: firstTrack.album_release_date,
                    spotify_url: firstTrackUrl,
                    cover_image: downloadResponse.data.metadata.cover_image || '',
                },
                downloadUrl: fileUrl,
            });
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
