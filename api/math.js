import express from 'express';
import math from 'mathjs';

const router = express.Router();

// Metadata for the service
const serviceMetadata = {
  name: 'Advanced Math Calculator',
  author: 'Jerome',
  description: 'Performs basic math operations, algebraic simplification, GCF, and LCM calculations.',
  category: 'Math',
  link: ['/api/math?operation=add&num1=5&num2=3']  // Example query link for addition
};

// Helper function for basic operations
function performMathOperation(operation, num1, num2) {
  let result;
  switch (operation) {
    case 'add':
    case '+':
      result = num1 + num2;
      break;
    case 'subtract':
    case '-':
      result = num1 - num2;
      break;
    case 'multiply':
    case '×':
      result = num1 * num2;
      break;
    case 'divide':
    case '÷':
      if (num2 === 0) {
        throw new Error('Division by zero is not allowed.');
      }
      result = num1 / num2;
      break;
    default:
      throw new Error('Invalid operation. Supported operations are: add, subtract, multiply, divide.');
  }
  return result;
}

// Algebraic simplification function using mathjs
function simplifyExpression(expression) {
  try {
    return math.simplify(expression).toString();
  } catch (error) {
    throw new Error('Invalid algebraic expression.');
  }
}

// Helper functions for GCF and LCM
function calculateGCF(num1, num2) {
  return math.gcd(num1, num2);
}

function calculateLCM(num1, num2) {
  return math.lcm(num1, num2);
}

// Math operation route
router.get('/math', (req, res) => {
  const { operation, num1, num2, expression } = req.query;

  // Validate basic operation parameters
  if (!operation && !expression && (num1 === undefined || num2 === undefined)) {
    return res.status(400).send(JSON.stringify({ error: 'Please provide valid operation or expression.' }, null, 2));
  }

  try {
    if (expression) {
      // Algebraic simplification
      const result = simplifyExpression(expression);
      res.send(JSON.stringify({ metadata: serviceMetadata, result: result }, null, 2));
      return;
    }

    if (num1 !== undefined && num2 !== undefined) {
      const number1 = parseFloat(num1);
      const number2 = parseFloat(num2);

      // Check if the provided numbers are valid
      if (isNaN(number1) || isNaN(number2)) {
        return res.status(400).send(JSON.stringify({ error: 'Both num1 and num2 must be valid numbers.' }, null, 2));
      }

      // Perform the math operation (add, subtract, multiply, divide)
      const result = performMathOperation(operation, number1, number2);
      res.send(JSON.stringify({ metadata: serviceMetadata, result: result }, null, 2));
      return;
    }

    if (operation === 'gcf' && num1 && num2) {
      const number1 = parseInt(num1, 10);
      const number2 = parseInt(num2, 10);
      const gcf = calculateGCF(number1, number2);
      res.send(JSON.stringify({ metadata: serviceMetadata, result: gcf }, null, 2));
      return;
    }

    if (operation === 'lcm' && num1 && num2) {
      const number1 = parseInt(num1, 10);
      const number2 = parseInt(num2, 10);
      const lcm = calculateLCM(number1, number2);
      res.send(JSON.stringify({ metadata: serviceMetadata, result: lcm }, null, 2));
      return;
    }

    return res.status(400).send(JSON.stringify({ error: 'Invalid query parameters provided.' }, null, 2));
  } catch (error) {
    return res.status(400).send(JSON.stringify({ error: error.message }, null, 2));
  }
});

export { router, serviceMetadata };
