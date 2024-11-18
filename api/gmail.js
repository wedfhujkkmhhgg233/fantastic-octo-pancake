import express from 'express';
import GmailNator from './GmailNator.js'; // Ensure GmailNator is in the same directory

const router = express.Router();

// Initialize GmailNator
const gmailNator = new GmailNator();

// Function to generate an email or fetch the inbox
async function handleTempMail(type, email = null) {
  try {
    // Initialize GmailNator session
    await gmailNator.init();

    if (type === 'gen') {
      // Generate a new temporary Gmail address
      const emailAddress = await gmailNator.getEmailOnline();
      return {
        status: 200,
        message: 'Temporary Gmail address generated successfully',
        email: emailAddress,
      };
    } else if (type === 'inbox' && email) {
      // Fetch inbox for the provided email
      const inbox = await gmailNator.getInbox(email);
      return {
        status: 200,
        message: `Inbox fetched for ${email}`,
        inbox,
      };
    } else {
      throw new Error('Invalid type or missing email for inbox check');
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
}

// Endpoint for handling tempmail actions
router.get('/tempmail', async (req, res) => {
  const { type, email } = req.query;

  if (!type) {
    return res.status(400).json({
      status: 400,
      message: 'Missing required parameter: type',
    });
  }

  const result = await handleTempMail(type, email);

  // Send the prettified JSON response
  res.status(result.status).json(result);
});

// Service Metadata
const serviceMetadata = {
  name: 'Temporary Gmail Generator',
  author: 'Jerome',
  description: 'Generates temporary Gmail addresses and checks inbox for messages.',
  category: 'Others',
  link: ["/api/tempmail?type=&email="] // Relative link to the endpoint
};

export { router, serviceMetadata };
