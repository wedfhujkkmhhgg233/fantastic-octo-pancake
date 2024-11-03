const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();

// Function to generate a unique, randomized filename
const generateUniqueFileName = () => {
    const randomString = crypto.randomBytes(8).toString('hex'); // Random 16-character hex string
    return `Jer-spotify-pro-${randomString}.mp3`;
};

// Spotify track fetch and download route
router.get('/spotify-download', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        // First API: Get the track URL
        const spotifyApiUrl = `https://spotify-play-iota.vercel.app/spotify?query=${query}`;
        const trackResponse = await axios.get(spotifyApiUrl);

        if (!trackResponse.data || !trackResponse.data.trackURLs) {
            throw new Error('Invalid data from the Spotify API');
        }

        const firstTrackUrl = trackResponse.data.trackURLs[0];

        // Second API: Get track details and download URL
        const trackDetailsUrl = `https://joshweb.click/api/spotify2?q=${firstTrackUrl}`;
        const trackDetails = await axios.get(trackDetailsUrl);

        if (!trackDetails.data || !trackDetails.data.result) {
            throw new Error('Invalid data from the track details API');
        }

        const downloadUrl = trackDetails.data.result.download_url;

        // Download the MP3 file with a unique name
        const mp3FileName = generateUniqueFileName();
        const mp3Path = path.join(__dirname, '..', 'public', mp3FileName);
        const mp3Stream = fs.createWriteStream(mp3Path);
        const response = await axios.get(downloadUrl, { responseType: 'stream' });

        response.data.pipe(mp3Stream);

        // Set file expiration
        setTimeout(() => {
            if (fs.existsSync(mp3Path)) {
                fs.unlinkSync(mp3Path);
            }
        }, 180000); // 3 minutes

        mp3Stream.on('finish', () => {
            const fileUrl = `https://jerome-web.gleeze.com/public/${mp3FileName}`;
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

module.exports = { router, serviceMetadata };
