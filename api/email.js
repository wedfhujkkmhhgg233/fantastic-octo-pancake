import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service Metadata
export const serviceMetadata = {
  name: 'Trivia API',
  author: 'Jerome Jamis',
  description: 'Fetches a random trivia question from the Open Trivia Database.',
  category: 'Others',
  link: ['/api/trivia'],
};

// Fetch Trivia Question
export const fetchTrivia = async () => {
  try {
    const response = await axios.get('https://opentdb.com/api.php?amount=1');
    const questionData = response.data.results[0];
    return {
      question: questionData.question,
      correct_answer: questionData.correct_answer,
      incorrect_answers: questionData.incorrect_answers,
    };
  } catch (error) {
    throw new Error('Error fetching trivia question: ' + error.message);
  }
};

// Router to handle Trivia request
router.get('/trivia', async (req, res) => {
  try {
    const trivia = await fetchTrivia();
    const triviaResponse = {
      question: trivia.question,
      answers: [...trivia.incorrect_answers, trivia.correct_answer],
      correct_answer: trivia.correct_answer,
    };
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(triviaResponse, null, 2)); // Pretty print with 2 spaces indentation
  } catch (error) {
    res.status(500).send(JSON.stringify({ error: error.message }, null, 2));
  }
});

export { router };
