import express from 'express';
import axios from 'axios';

const router = express.Router();
const chatHistory = new Map();

router.get('/chipkura', async (req, res) => {
  const { message, userid, imageurl } = req.query;

  if (!message || !userid) {
    return res.status(400).json({ error: 'Missing required parameters: message or userid' });
  }

  const chatSessionId = 'f3f62523-411d-4d6b-b1d0-3de031c27b22';
  if (!chatHistory.has(userid)) chatHistory.set(userid, []);
  const messages = chatHistory.get(userid);

  const userMessage = imageurl ? `${message} ![](${imageurl}) %START_MESSAGE_METADATA%(The user has uploaded images to this message. Here are the URLs for the images: ${imageurl})` : message;

  messages.push({ role: 'user', content: userMessage });

  const sendToChipp = async () => {
    const response = await axios.post('https://kurapika-42900.chipp.ai/api/chat', { messages, chatSessionId }, {
      headers: {
        'accept': '/',
        'content-type': 'application/json',
        'cookie': '__Host-next-auth.csrf-token=your-token; __Secure-next-auth.callback-url=https://app.chipp.ai; userId_42900=your-userid; correlationId=your-correlation-id',
        'origin': 'https://kurapika-42900.chipp.ai',
        'referer': 'https://kurapika-42900.chipp.ai/w/chat/',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K)',
      }
    });
    return response.data;
  };

  const parseResponse = (raw) => {
    const lines = raw.split('\n');
    let browseWebDetected = false;
    let retrieveUrlDetected = false;
    let result = { message: '', image: null };
    let browseData = [];
    let retrieveData = null;

    for (const line of lines) {
      const index = line.indexOf(':');
      if (index === -1) continue;
      const code = line.slice(0, index);
      const content = line.slice(index + 1).trim();
      if (!content) continue;

      try {
        if (code === '0') {
          result.message += JSON.parse(content);
        } else if (code === '9') {
          const json = JSON.parse(content);
          if (json.toolName === 'browseWeb') {
            browseWebDetected = true;
          } else if (json.toolName === 'retrieveUrl') {
            retrieveUrlDetected = true;
          }
        } else if (code === 'a') {
          const json = JSON.parse(content);

          // Handle retrieveUrl error
          if (json.toolName === 'retrieveUrl' && json.result?.includes('Error: Query is required and cannot be empty')) {
            result.message += `\nError: ${json.result}`;
            messages.push({
              role: 'assistant',
              content: '',
              toolInvocations: [{
                state: 'result',
                toolCallId: `call_${Math.random().toString(36).substr(2, 9)}`,
                toolName: 'retrieveUrl',
                args: { url: json.args?.url },
                result: `Error: ${json.result}`
              }]
            });
          }

          // Handle successful retrieveUrl
          if (json.result?.markdown) {
            retrieveData = {
              url: json.args?.url,
              query: json.args?.query,
              markdown: json.result.markdown
            };
            result.message += '\n' + retrieveData.markdown;
          }

          // Handle images
          const match = json.result?.match?.(/https?:\/\/[^\s)]+/);
          if (match) result.image = match[0];
        }
      } catch (e) {
        console.warn(`Skipping malformed line [${code}]: ${content}`);
      }
    }

    return { result, browseWebDetected, retrieveUrlDetected, browseData, retrieveData };
  };

  try {
    const raw1 = await sendToChipp();
    const { result: result1, browseWebDetected, retrieveUrlDetected, browseData, retrieveData } = parseResponse(raw1);

    if (retrieveUrlDetected) {
      console.log('[Full raw response for retrieveUrl]', raw1);

      // If retrieveUrl error detected, we skip the user message and resend with error in history
      messages.push({ role: 'assistant', content: result1.message });
      const raw2 = await sendToChipp();
      const { result: result2 } = parseResponse(raw2);

      // Push the updated history with the error response
      messages.push({
        role: 'assistant',
        content: result2.message,
        toolInvocations: [{
          state: 'result',
          toolCallId: `call_${Math.random().toString(36).substr(2, 9)}`,
          toolName: 'retrieveUrl',
          args: { url: retrieveData.url, query: retrieveData.query },
          result: retrieveData.markdown
        }]
      });
      return res.json(result2);
    } else {
      messages.push({ role: 'assistant', content: result1.message });
      return res.json(result1);
    }

  } catch (err) {
    console.error('[chipkura error]', err.message);
    res.status(500).json({ error: 'Failed to contact Chipp AI.' });
  }
});

const serviceMetadata = {
  name: "chipkura",
  description: "Talk to Chipp AI with optional image input and memory. Supports browseWeb and retrieveUrl tool handling.",
  category: "AI",
  author: "Jerome",
  link: ["/api/chipkura?message=hi&userid=&imageurl="]
};

export { router, serviceMetadata };
