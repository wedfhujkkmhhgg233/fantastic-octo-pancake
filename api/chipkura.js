import express from 'express';
import axios from 'axios';
import { sendRequest, responseMap } from './retrieveurl.js';

const router = express.Router();
const chatHistory = new Map();

router.get('/chipkura', async (req, res) => {
  const { message, userid, imageurl } = req.query;

  if (!message || !userid) {
    return res.status(400).json({ error: 'Missing required parameters: message or userid' });
  }

  if (!chatHistory.has(userid)) chatHistory.set(userid, []);
  const messages = chatHistory.get(userid);

  const userMessage = imageurl
    ? `${message} ![](${imageurl}) %START_MESSAGE_METADATA%(The user has uploaded images to this message. Here are the URLs for the images: ${imageurl})`
    : message;

  messages.push({
    role: 'user',
    content: userMessage,
    parts: [{ type: 'text', text: userMessage }]
  });

  const sendToChipp = async () => {
    const response = await axios.post(
      'https://kurapika-42900.chipp.ai/api/chat',
      {
        id: Math.random().toString(36).substring(2, 12),
        messages,
        chatSessionId: '01b29ece-93eb-4c9c-aa92-96bf0b51ff7f'
      },
      {
        headers: {
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'x-app-name-id': 'Kurapika-42900',
          referer: 'https://kurapika-42900.chipp.ai/w/chat/kurapika-42900/session/01b29ece-93eb-4c9c-aa92-96bf0b51ff7f',
          'referrer-policy': 'strict-origin-when-cross-origin',
          'user-agent': 'Mozilla/5.0'
        },
        responseType: 'text' // streaming comes raw
      }
    );

    return response.data;
  };

  const parseResponse = async (raw) => {
    let result = { message: '', image: null };

    try {
      const lines = raw.split(/\r?\n/);

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

        // detect image URLs inside any line
        const imgMatch = line.match(/https:\/\/storage\.googleapis\.com\/chipp-images\/[^\s"]+\.jpg/);
        if (imgMatch) {
          result.image = imgMatch[0];
        }
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
      result.image = finalResponse.image;
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
  description: "Talk to Chipp AI with optional image input and memory. Detects chipp-generated image URLs automatically.",
  category: "AI",
  author: "Jerome",
  link: ["/chipkura?message=hi&userid=&imageurl="]
};

export { router, serviceMetadata };
