import express from 'express';
import axios from 'axios';

const router = express.Router();

// Base URL for 1secmail API
const baseUrl = 'https://www.1secmail.com/api/v1';

// Function to generate temporary email addresses
async function generateEmails(count = 1) {
  try {
    const response = await axios.get(`${baseUrl}/?action=genRandomMailbox&count=${count}`);
    return {
      status: 200,
      message: 'Temporary email addresses generated successfully',
      emails: response.data,
    };
  } catch (error) {
    return {
      status: 500,
      message: 'Error generating emails',
      error: error.message,
    };
  }
}

// Function to fetch inbox for a specific email
async function fetchInbox(email) {
  try {
    const [login, domain] = email.split('@');
    const response = await axios.get(`${baseUrl}/?action=getMessages&login=${login}&domain=${domain}`);

    if (response.data.length === 0) {
      return {
        status: 200,
        message: 'No messages in the inbox',
        inbox: [],
      };
    }

    // Fetch full message details for each email
    const messages = await Promise.all(
      response.data.map(async (message) => {
        const messageResponse = await axios.get(
          `${baseUrl}/?action=readMessage&login=${login}&domain=${domain}&id=${message.id}`
        );
        return messageResponse.data;
      })
    );

    return {
      status: 200,
      message: `Fetched inbox for ${email}`,
      inbox: messages,
    };
  } catch (error) {
    return {
      status: 500,
      message: 'Error fetching inbox',
      error: error.message,
    };
  }
}

// Endpoint to handle tempmail actions
router.get('/tempmail', async (req, res) => {
  const { type, email, count } = req.query;

  let result;
  if (type === 'gen') {
    // Generate temporary email addresses
    result = await generateEmails(count || 1);
    return res.status(result.status).json(JSON.parse(JSON.stringify(result, null, 2)));
  } else if (type === 'inbox') {
    if (!email) {
      return res.status(400).json(
        JSON.parse(
          JSON.stringify(
            {
              status: 400,
              message: 'Missing email parameter',
            },
            null,
            2
          )
        )
      );
    }
    // Fetch inbox for the provided email
    result = await fetchInbox(email);
    return res.status(result.status).json(JSON.parse(JSON.stringify(result, null, 2)));
  } else {
    return res.status(400).json(
      JSON.parse(
        JSON.stringify(
          {
            status: 400,
            message: 'Invalid type parameter. Use "gen" or "inbox".',
          },
          null,
          2
        )
      )
    );
  }
});

// Service Metadata
const serviceMetadata = {
  name: '1SecMail Temporary Mail',
  author: 'Jerome',
  description:
    'Generates temporary email addresses using 1SecMail API and fetches inbox with message details.',
  category: 'Others',
  link: ["/api/tempmail?type=gen+or+inbox&email="] // Relative link to the endpoint
};

// Make the service metadata pretty
const prettyServiceMetadata = JSON.stringify(serviceMetadata, null, 2);

export { router, serviceMetadata };
