import express from 'express';
import axios from 'axios';
import { sendRequest, responseMap } from './retrieveurl.js';

const router = express.Router();
const chatHistory = new Map();

router.get('/chipkura', async (req, res) => {
  let { message, userid, imageurl } = req.query;

  if (!message || !userid) {
    return res.status(400).json({ error: 'Missing required parameters: message or userid' });
  }

  // normalize imageurl to array (accept comma-separated or multiple query params)
  let imageUrls = [];
  if (imageurl) {
    if (Array.isArray(imageurl)) {
      imageUrls = imageurl;
    } else if (typeof imageurl === 'string') {
      imageUrls = imageurl.split(',').map(u => u.trim()).filter(u => u);
    }
  }

  if (!chatHistory.has(userid)) chatHistory.set(userid, []);
  const messages = chatHistory.get(userid);

  const userMessage = imageUrls.length > 0
    ? `${message} ${imageUrls.map(url => `![](${url})`).join(' ')} %START_MESSAGE_METADATA%(The user has uploaded images to this message. Here are the URLs for the images: ${imageUrls.join(', ')})`
    : message;

  messages.push({
    role: 'user',
    content: userMessage,
    parts: [{ type: 'text', text: userMessage }]
  });

  const sendToChipp = async () => {
    const response = await axios.post(
      'https://copyofaitutor-10021358.chipp.ai/api/chat',
      {
        id: Math.random().toString(36).substring(2, 12),
        messages,
        chatSessionId: '9f1e6926-f4c6-4f4f-ab1f-6fcb805d455e'
      },
      {
        headers: {
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'x-app-name-id': 'Copyofaitutor-10021358',
          referer: 'https://copyofaitutor-10021358.chipp.ai/w/chat/kurapika-10019682/session/96637cf9-e615-496f-9129-efcd1c8d1391',
          'referrer-policy': 'strict-origin-when-cross-origin',
          'user-agent': 'Mozilla/5.0'
        },
        responseType: 'text' // streaming comes raw
      }
    );

    return response.data;
  };

  const parseResponse = async (raw) => {
    let result = { message: '', image: [] };

    try {
      const lines = raw.split(/\r?\n/);
      const foundImages = [];

      for (const line of lines) {
        if (!line.trim()) continue;

        // only keep "0:" lines (assistant real message)
        if (line.startsWith('0:')) {
          const match = line.match(/0:"(.*)"/);
          if (match) {
            // convert escaped newlines to real newlines
            result.message += match[1].replace(/\\n/g, '\n');
          }
        }

        // detect ALL image URLs inside any line
        const imgMatches = line.match(/https:\/\/storage\.googleapis\.com\/chipp-images\/[^\s"]+\.jpg/g);
        if (imgMatches) {
          foundImages.push(...imgMatches);
        }
      }

      if (foundImages.length > 0) {
        // remove duplicates
        result.image = [...new Set(foundImages)];
      }
    } catch (e) {
      console.error('Error parsing response:', e.message);
    }

    return result;
  };

  try {
    const raw = await sendToChipp();
    const result = await parseResponse(raw);

    // allow external override via responseMap (if exists)
    const finalResponse = responseMap.get('finalResponse');
    if (finalResponse) {
      result.message = finalResponse.message;
      if (Array.isArray(finalResponse.image)) {
        result.image = finalResponse.image;
      } else if (typeof finalResponse.image === 'string') {
        result.image = [finalResponse.image];
      }
      responseMap.delete('finalResponse');
    }

    messages.push({ role: 'assistant', content: result.message });
    return res.json(result);

  } catch (err) {
    console.error('Chipkura error:', err.message);
    return res.status(500).json({ error: 'Failed to contact Chipp AI.' });
  }
});

const serviceMetadata = {
  name: "chipkura",
  description: "Talk to Chipp AI with optional multiple image inputs and memory. Detects multiple chipp-generated image URLs automatically, returned as an array.",
  category: "AI",
  author: "Jerome",
  link: ["/chipkura?message=hi&userid=&imageurl=url1,url2"]
};

export { router, serviceMetadata };
