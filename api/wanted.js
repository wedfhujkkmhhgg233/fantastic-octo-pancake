import express from 'express';
import fs from 'fs-extra';
import DIG from 'discord-image-generation';
import superfetch from 'node-superfetch';

const router = express.Router();

router.get('/wanted', async (req, res) => {
    const uid = req.query.uid;

    // Validate that the uid is provided and is a numeric value
    if (!uid || !/^\d+$/.test(uid)) {
        return res.status(400).json({
            error: "Please provide a valid numeric user ID with the 'uid' query parameter, e.g., /wanted?uid=123456"
        });
    }

    try {
        // Fetch the user's avatar from the Facebook Graph API
        const avatarResponse = await superfetch.get(
            `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
        );
        const avatar = avatarResponse.body;

        // Generate the "wanted" image using discord-image-generation
        const img = await new DIG.Wanted().getImage(avatar);
        const path_wanted = './cache/wanted.png';

        // Save the image to a fixed file path
        fs.writeFileSync(path_wanted, img);

        // Send the generated image
        res.status(200).sendFile(path_wanted, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).json({ error: "Failed to send image file." });
            }
            // Delete the image file after sending
            fs.unlinkSync(path_wanted);
        });
    } catch (error) {
        console.error("Error generating wanted image:", error);
        res.status(500).json({ error: "An error occurred while processing the wanted image." });
    }
});

// Route metadata
const serviceMetadata = {
    name: "Wanted",
    author: "tdunguwu",
    description: "Generates a 'wanted' poster image for a specified Facebook user ID",
    category: "Canvas",
    link: ["/api/wanted?uid="]
};

export { router, serviceMetadata };
