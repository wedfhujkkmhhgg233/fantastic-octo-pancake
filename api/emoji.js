import express from 'express';

const router = express.Router();

// Service Metadata
const serviceMetadata = {
    name: "Emoji Mix",
    author: "Jerome",
    description: "Combine two emojis into a custom Emoji Kitchen sticker.",
    category: "Fun",
    link: "/api/emoji-mix?emoji1=&emoji2=", // Relative link to the endpoint
};

// Emoji Mix Route
router.get('/emoji-mix', (req, res) => {
    // Get query parameters
    const emoji1 = req.query.emoji1 || '🥺'; // Default emoji1
    const emoji2 = req.query.emoji2 || '😮'; // Default emoji2

    // Encode the emojis to match the required format
    const encodedEmoji1 = `u${emoji1.codePointAt(0).toString(16)}`; // Encode emoji1
    const encodedEmoji2 = `u${emoji2.codePointAt(0).toString(16)}`; // Encode emoji2

    // Construct the emoji mix URL
    const emojiMixUrl = `https://www.gstatic.com/android/keyboard/emojikitchen/20230301/${encodedEmoji1}/${encodedEmoji1}_${encodedEmoji2}.png`;

    // Prepare the JSON response
    const response = {
        status: 200,
        message: "Emoji Mix Generated Successfully",
        endpoint: `/emoji-mix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`,
        locale: "en",
        results: [
            {
                id: "8584330421895299042",
                title: "",
                media_formats: {
                    png_transparent: {
                        url: emojiMixUrl,
                        duration: 0,
                        preview: "",
                        dims: [534, 534],
                        size: 17294,
                    },
                },
                created: Math.floor(Date.now() / 1000),
                content_description: "Sticker",
                h1_title: "Sticker",
                itemurl: "",
                url: emojiMixUrl,
                tags: [emoji1, emoji2],
                flags: ["sticker", "static"],
                hasaudio: false,
                result_token: "",
                content_description_source: "CONTENT_DESCRIPTION_SOURCE_UNSPECIFIED",
            },
        ],
        next: "",
    };

    // Send the prettified JSON response
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(response, null, 2)); // Pretty JSON format
});

export { router, serviceMetadata };
