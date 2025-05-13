import axios from 'axios';
import fs from 'fs';

// Chat history
const chatHistory = new Map();
const headers = {
  'authority': 'kurapika-42900.chipp.ai',
  'accept': '/',
  'accept-language': 'en-US,en;q=0.9',
  'content-type': 'application/json',
  'cookie': '__Host-next-auth.csrf-token=your-token; __Secure-next-auth.callback-url=https://app.chipp.ai; userId_42900=your-userid; correlationId=your-correlation-id',
  'origin': 'https://kurapika-42900.chipp.ai',
  'referer': 'https://kurapika-42900.chipp.ai/w/chat/',
  'user-agent': 'Mozilla/5.0'
};

const sessionId = 'f3f62523-411d-4d6b-b1d0-3de031c27b22';

async function triggerTool(toolName, args) {
  switch (toolName) {
    case 'retrieveUrl':
      console.log('Triggering tool: retrieveUrl with arguments:', args);
      break;
    default:
      console.log('Unknown tool triggered:', toolName);
  }
}

export async function sendRequest(messages) {
  let continueLoop = true;
  const localMessages = [...messages];
  let step = 0;

  while (continueLoop) {
    try {
      const response = await axios.post(
        'https://kurapika-42900.chipp.ai/api/chat',
        { messages: localMessages, chatSessionId: sessionId },
        { headers }
      );

      const raw = response.data;
      const lines = raw.split('\n');
      const toolInvocation = {
        role: 'assistant',
        content: '',
        toolInvocations: []
      };

      const result = {
        message: '',
        image: null,
        meta: {}
      };

      let hasPlainTextResponse = false;
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
            await triggerTool(json.toolName, json.args);
          }

        } catch (err) {
          console.warn(`Malformed line [${code}]: ${content}`);
        }
      }

      if (toolInvocation.toolInvocations.length > 0) {
        localMessages.push(toolInvocation);
        localMessages.push({ role: 'assistant', content: '', chatSessionId: sessionId });
      }

      chatHistory.set(sessionId, localMessages);

      if (hasPlainTextResponse) {
        continueLoop = false;
        return result;
      }

    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      break;
    }
  }

  return null;
  }
