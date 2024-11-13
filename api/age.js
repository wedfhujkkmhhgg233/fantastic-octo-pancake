import express from 'express';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: "Age Calculator",
    author: "Jerome Jamis",
    description: "Calculates age in years, months, and days based on birthdate provided as separate year, month, and date fields.",
    category: "Utilities",
    link: ["/api/age-calculate?year=&month=&date="]
};

// Age calculation function
function calculateAge(year, month, date) {
    const today = new Date();
    const birth = new Date(year, month - 1, date); // Month is 0-based in JavaScript

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    // Adjust months and days if negative
    if (days < 0) {
        months--;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months, days };
}

// Age Calculator Route
router.get('/age-calculate', (req, res) => {
    const { year, month, date } = req.query;

    // Validate that all parameters are provided
    if (!year || !month || !date) {
        return res.status(400).json({
            success: false,
            message: "Please provide year, month, and date parameters."
        });
    }

    try {
        const age = calculateAge(year, month, date);

        res.json({
            success: true,
            message: `Calculated age based on birthdate ${year}-${month}-${date}.`,
            data: age
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while calculating the age.",
            error: error.message
        });
    }
});

export { router, serviceMetadata };
