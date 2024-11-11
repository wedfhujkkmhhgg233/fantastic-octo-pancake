import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route metadata
const serviceMetadata = {
    name: 'Meal Recipe',
    author: 'Jerome Jamis',
    description: 'Fetches meal recipes based on the search term',
    category: 'Search',
    link: ["/api/meal-recipe?s="]
};

// Meal Recipe Route
router.get('/meal-recipe', async (req, res) => {
    const { s } = req.query;  // Search term (e.g., "Chicken")

    if (!s) {
        return res.status(400).json({
            success: false,
            message: `
                Missing 's' parameter.
                
                Guide:
                - 's' (required): The search term for the recipe. Example: ?s=Chicken
                
                Full example: /api/meal-recipe?s=Chicken
            `
        });
    }

    try {
        // Make API request to TheMealDB
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${s}`);
        
        if (response.data.meals) {
            const meals = response.data.meals.map((meal) => ({
                name: meal.strMeal,
                category: meal.strCategory,
                area: meal.strArea,
                instructions: meal.strInstructions,
                image: meal.strMealThumb,
                ingredients: Object.keys(meal)
                    .filter((key) => key.includes('strIngredient') && meal[key])
                    .map((key) => meal[key])
            }));

            const formattedResponse = JSON.stringify({
                success: true,
                message: `Meal recipes for "${s}" fetched successfully`,
                data: meals
            }, null, 2);

            res.type('json').send(formattedResponse);
        } else {
            res.status(404).json({
                success: false,
                message: `No meals found for "${s}". Please try another search term.`
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch data from TheMealDB API",
            error: error.message
        });
    }
});

export { router, serviceMetadata };
