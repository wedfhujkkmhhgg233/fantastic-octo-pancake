import express from 'express';

const router = express.Router();

// Function to convert numbers to words
function numberToWords(num) {
    const belowTwenty = [
        'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const tens = [
        '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];
    const thousands = [
        '', 'Thousand', 'Million', 'Billion', 'Trillion'
    ];

    if (num === 0) return belowTwenty[0];

    function helper(n) {
        if (n < 20) return belowTwenty[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + belowTwenty[n % 10] : '');
        if (n < 1000) return belowTwenty[Math.floor(n / 100)] + ' Hundred' + (n % 100 > 0 ? ' ' + helper(n % 100) : '');
        for (let i = 0; i < thousands.length; i++) {
            const unit = 1000 ** (i + 1);
            if (n < unit) return helper(Math.floor(n / (unit / 1000))) + ' ' + thousands[i] + (n % (unit / 1000) > 0 ? ' ' + helper(n % (unit / 1000)) : '');
        }
    }

    return helper(num);
}

// Route to convert numbers to words
router.get('/numbers', (req, res) => {
    const { numbers } = req.query;

    // Validate input
    if (!numbers) {
        return res.status(400).json({
            error: "Please provide 'numbers' query parameter."
        });
    }

    // Split the numbers string into an array and convert each to words
    const numberArray = numbers.split(' ').map(numStr => {
        const num = parseInt(numStr, 10);
        return isNaN(num) ? numStr : numberToWords(num);
    });

    const convertedText = numberArray.join(', ');

    // Respond with the converted text in the specified format
    res.json({
        api_info: {
            api_name: "Numbers to Words",
            description: "The Numbers to Words API provides a simple service for converting numerical values into their equivalent English words.",
            author: "Jerome"
        },
        original: numbers,
        converted: convertedText
    });
});

// Metadata for the Numbers to Words service
const serviceMetadata = {
    name: "Numbers to Words",
    author: "Jerome",
    description: "Converts numbers into words.",
    category: "Others",
    link: ["/api/numbers?numbers=123%20456%20789"]
};

export { router, serviceMetadata };
