import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Service Metadata
export const serviceMetadata = {
  name: 'Email Sender',
  author: 'Jerome Jamis',
  description: 'Sends an email with the provided email address and text.',
  category: 'Others',
  link: ['/api/email-sender?email=&text='],
};

// Email sender function
export const sendEmail = async ({ email, text }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'webjerome91@gmail.com', // Your email address
      pass: 'jeromeweb74727', // Your password
    },
  });

  const mailOptions = {
    from: 'webjerome91@gmail.com', // Sender's email address
    to: email, // Recipient's email address
    subject: 'Hello from Jerome Web',
    text: text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return `Email sent: ${info.response}`;
  } catch (error) {
    throw new Error(`Error occurred: ${error.message}`);
  }
};

// Router to handle the email sending request via GET
router.get('/email-sender', async (req, res) => {
  const { email, text } = req.query;
  if (!email || !text) {
    return res.status(400).json({ error: 'Email and text are required.' });
  }

  try {
    const result = await sendEmail({ email, text });
    res.json({ message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router };
