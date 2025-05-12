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

  const userMessage = imageurl
    ? `${message} ![](${imageurl}) %START_MESSAGE_METADATA%(The user has uploaded images to this message. Here are the URLs for the images: ${imageurl})`
    : message;

  messages.push({ role: 'user', content: userMessage });

  const sendToChipp = async () => {
    const response = await axios.post('https://kurapika-42900.chipp.ai/api/chat', {
      messages,
      chatSessionId
    }, {
      headers: {
        'accept': '/',
        'content-type': 'application/json',
        'cookie': '__Host-next-auth.csrf-token=your-token; __Secure-next-auth.callback-url=https://app.chipp.ai; userId_42900=your-userid; correlationId=your-correlation-id',
        'origin': 'https://kurapika-42900.chipp.ai',
        'referer': 'https://kurapika-42900.chipp.ai/w/chat/',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K)'
      }
    });
    return response.data;
  };

  const parseResponse = (raw) => {
    const lines = raw.split('\n');
    let browseWebDetected = false;
    let retrieveUrlDetected = false;
    let retrieveTool = null;
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
            retrieveTool = json;
          }
        } else if (code === 'a') {
          const json = JSON.parse(content);

          // BrowseWeb
          if (json.result?.organic) {
            browseData = json.result.organic.map(item => ({
              title: item.title,
              link: item.link,
              snippet: item.snippet
            }));
            const formatted = browseData.map((item, i) =>
              `Result ${i + 1}:\nTitle: ${item.title}\nLink: ${item.link}\nSnippet: ${item.snippet}`
            ).join('\n');
            result.message += '\n' + formatted;
          }

          // RetrieveUrl
          if (json.result?.markdown) {
            retrieveData = {
              url: json.args?.url,
              query: json.args?.query,
              markdown: json.result.markdown
            };
            result.message += '\n' + retrieveData.markdown;
          }

          // RetrieveUrl Error (handled here)
          if (typeof json.result === 'string' && json.toolName === 'retrieveUrl' && json.result.includes('Error:')) {
            const assistantObj = {
              role: 'assistant',
              content: '',
              toolInvocations: [
                {
                  state: 'result',
                  toolCallId: json.toolCallId,
                  toolName: json.toolName,
                  args: json.args,
                  result: json.result
                }
              ]
            };
            messages.push(assistantObj);
            return { result, browseWebDetected, retrieveUrlDetected, retrieveData, retrieveTool, isRetrieveError: true };
          }

          // Image Detection
          const match = json.result?.match?.(/https?:\/\/[^\s)]+/);
          if (match) result.image = match[0];
        }
      } catch (e) {
        console.warn(`Skipping malformed line [${code}]: ${content}`);
      }
    }

    return { result, browseWebDetected, retrieveUrlDetected, retrieveData, retrieveTool, isRetrieveError: false };
  };

  try {
    const raw1 = await sendToChipp();
    const {
      result: result1,
      browseWebDetected,
      retrieveUrlDetected,
      retrieveData,
      retrieveTool,
      isRetrieveError
    } = parseResponse(raw1);

    if (isRetrieveError && retrieveTool?.args?.url) {
      // Resend only the retrieveUrl tool with a better query
      const toolCallMessage = {
        toolInvocations: [{
          toolName: 'retrieveUrl',
          args: {
            url: retrieveTool.args.url,
            query: `What is the purpose of the website ${retrieveTool.args.url}, what features does it offer, and how does it work?`
          }
        }]
      };
      messages.push(toolCallMessage);

      const raw2 = await sendToChipp();
      const { result: result2 } = parseResponse(raw2);
      messages.push({ role: 'assistant', content: result2.message });
      return res.json(result2);
    }

    if (browseWebDetected) {
      messages.push({
        role: 'assistant',
        content: browseData.map((item, i) =>
          `Browse Result ${i + 1}:\nTitle: ${item.title}\nLink: ${item.link}\nSnippet: ${item.snippet}`
        ).join('\n\n')
      });
      messages.push({ role: 'user', content: userMessage });
      const raw2 = await sendToChipp();
      const { result: result2 } = parseResponse(raw2);
      messages.push({ role: 'assistant', content: result2.message });
      return res.json(result2);

    } else if (retrieveUrlDetected && retrieveData?.markdown) {
      messages.push({
        role: 'assistant',
        content: retrieveData.markdown
      });
      messages.push({ role: 'user', content: userMessage });
      const raw2 = await sendToChipp();
      const { result: result2 } = parseResponse(raw2);
      messages.push({ role: 'assistant', content: result2.message });
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
  description: "Talk to Chipp AI with optional image input and memory. Handles browseWeb and retrieveUrl, including retry on errors.",
  category: "AI",
  author: "Jerome",
  link: ["/api/service/chipkura?message=hi&userid=&imageurl="]
};

export { router, serviceMetadata };
