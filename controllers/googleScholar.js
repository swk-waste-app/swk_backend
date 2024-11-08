import axios from 'axios';

// Function to fetch articles from Google Scholar using ScrapingDog API
export const fetchGoogleScholarArticles = async (req, res, next) => {
    try {
        const api_key = process.env.SCRAPINGDOG_API_KEY; // Store your API key in .env
        const query = req.query.query || 'waste management recycling circular economy'; // Default query
        const url = 'https://api.scrapingdog.com/google_scholar/';
        
        // Request parameters
        const params = {
            api_key: api_key,
            query: query,
            language: 'en',
            page: 1,
            results: 10
        };

        // Make the API request
        const response = await axios.get(url, { params: params });

        if (response.status === 200) {
            const data = response.data;
            res.status(200).json(data);
        } else {
            res.status(response.status).json({ message: 'Request failed with status code: ' + response.status });
        }
    } catch (error) {
        next(error); // Pass errors to the error-handling middleware
    }
};
