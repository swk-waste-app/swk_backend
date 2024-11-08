import axios from "axios";


// Controller function to fetch news articles
export const fetchNewsArticles = async (req, res, next) => {
    try {
        // Define the URL and parameters for the NewsAPI request
        const apiKey = process.env.NEWS_API_KEY; // Store your API key in .env
        const query = 'waste management OR recycling OR upcycling'; // Define your search query
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${apiKey}`;

        // Make the request to NewsAPI
        const response = await axios.get(url);

        // Respond with the articles
        res.status(200).json(response.data.articles);
    } catch (error) {
        next(error); // Handle errors with next middleware
    }
};