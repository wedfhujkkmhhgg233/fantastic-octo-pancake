import express from 'express';

const router = express.Router();

// Service Metadata
export const serviceMetadata = {
  name: 'Emoji Mix Generator',
  author: 'Jerome Jamis',
  description: 'Generates a mixed emoji sticker using two provided emojis.',
  category: 'Others',
  link: ['/api/emoji-mix?emoji1=&emoji2='],
};

// Emoji Mix Route
router.get('/emoji-mix', (req, res) => {
  // Get query parameters
  const emoji1 = req.query.emoji1 || '🥺'; // Default emoji1
  const emoji2 = req.query.emoji2 || '😮'; // Default emoji2

  // Construct the emoji mix URL
  const emojiMixUrl = `https://www.gstatic.com/android/keyboard/emojikitchen/20230301/${encodeURIComponent(
    emoji1
  )}_${encodeURIComponent(emoji2)}.png`;

  // Prepare the JSON response
  const response = {
    locale: 'en',
    results: [
      {
        id: '8584330421895299042',
        title: '',
        media_formats: {
          png_transparent: {
            url: emojiMixUrl,
            duration: 0,
            preview: '',
            dims: [534, 534],
            size: 17294,
          },
        },
        created: Math.floor(Date.now() / 1000),
        content_description: 'Sticker',
        h1_title: 'Sticker',
        itemurl: '',
        url: emojiMixUrl,
        tags: [emoji1, emoji2],
        flags: ['sticker', 'static'],
        hasaudio: false,
        result_token: '',
        content_description_source: 'CONTENT_DESCRIPTION_SOURCE_UNSPECIFIED',
      },
    ],
    next: '',
  };

  // Send the prettified JSON response
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(response, null, 2));
});

export { router };
