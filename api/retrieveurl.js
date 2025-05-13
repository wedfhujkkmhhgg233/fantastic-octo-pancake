import axios from 'axios';

const chatHistory = new Map();
const responseMap = new Map();  // This will store final responses
const headers = {
  'authority': 'kurapika-42900.chipp.ai',
  'accept': '/',
  'accept-language': 'en-US,en;q=0.9',
  'content-type': 'application/json',
  'cookie': '__Host-next-auth.csrf-token=your-token; __Secure-next-auth.callback-url=https://app.chipp.ai; userId_42900=your-userid; correlationId=your-correlation-id',
  'origin': 'https://kurapika-42900.chipp.ai',
  'referer': 'https://kurapika-42900.chipp.ai/w/chat/',
  'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
};

const sessionId = 'f3f62523-411d-4d6b-b1d0-3de031c27b22';

async function sendRequest(messages) {
  let continueLoop = true;
  const localMessages = [...messages];

  while (continueLoop) {
    console.log('--- Sending Request ---');

    try {
      const response = await axios.post(
        'https://kurapika-42900.chipp.ai/api/chat',
        { messages: localMessages, chatSessionId: sessionId },
        { headers }
      );

      const raw = response.data;
      console.log('Received Response:', raw);

      const lines = raw.split('\n');
      const result = {
        message: '',
        image: null,
        meta: {}
      };

      let hasPlainTextResponse = false;
      let toolInvocation = { role: 'assistant', content: '', toolInvocations: [] };
      let tempToolCall = {};
      let toolResultErrorFix = false;

      for (const line of lines) {
        const index = line.indexOf(':');
        if (index === -1) continue;

        const code = line.slice(0, index);
        const content = line.slice(index + 1).trim();
        if (!content) continue;

        try {
          const json = JSON.parse(content);

          if (code === '0') {
            result.message += json;
            hasPlainTextResponse = true;
          } else if (code === '9') {
            tempToolCall = {
              state: 'called',
              toolCallId: json.toolCallId,
              toolName: json.toolName,
              args: json.args
            };
          } else if (code === 'a' && tempToolCall.toolCallId === json.toolCallId) {
            if (typeof json.result === 'string' && json.result.includes('Query is required')) {
              console.log('Fixing missing query by inserting "hello"...');
              tempToolCall.args.query = 'hello';
              tempToolCall.result = json.result;
              tempToolCall.state = 'result';
              toolInvocation.toolInvocations.push(tempToolCall);
              toolResultErrorFix = true;
              tempToolCall = {};
            } else {
              tempToolCall.result = json.result;
              tempToolCall.state = 'result';
              toolInvocation.toolInvocations.push(tempToolCall);
              tempToolCall = {};
            }
          } else if (code === 'e' || code === 'd') {
            result.meta.usage = json.usage;
          }

          if (json.toolName) {
            console.log(`Tool triggered: ${json.toolName}`);
            await triggerTool(json.toolName, json.args);
          }

        } catch (err) {
          console.warn(`Malformed line [${code}]: ${content}`);
        }
      }

      if (toolInvocation.toolInvocations.length > 0) {
        localMessages.push(toolInvocation);
        localMessages.push({ role: 'assistant', content: '', chatSessionId: sessionId });
        console.log('Appended toolInvocations to messages.');
      }

      chatHistory.set(sessionId, localMessages);
      console.log('Full message history stored in memory (chatHistory).');

      if (hasPlainTextResponse) {
        responseMap.set('finalResponse', result);  // Store final response directly
        console.log('Final response saved to responseMap as "finalResponse".');
        continueLoop = false;  // Exit loop
        return result;
      }

      if (toolResultErrorFix) {
        console.log('Tool result error fixed; resending updated message...');
      }

    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      break;
    }
  }

  return null;  // In case loop breaks with no result
}

async function triggerTool(toolName, args) {
  switch (toolName) {
    case 'retrieveUrl':
      console.log('Triggering tool: retrieveUrl with arguments:', args);
      break;
    default:
      console.log('Unknown tool triggered:', toolName);
  }
}

export { sendRequest, responseMap };
