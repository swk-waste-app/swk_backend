// API Test Script
const API_BASE_URL = 'http://localhost:6060/api';

const testEndpoints = [
    // Products endpoints
    { method: 'GET', url: `${API_BASE_URL}/products`, description: 'Get all products' },
    { method: 'GET', url: `${API_BASE_URL}/products/count`, description: 'Get products count' },
    
    // News endpoints
    { method: 'GET', url: `${API_BASE_URL}/news/news`, description: 'Get news articles' },
    
    // Google Scholar endpoints
    { method: 'GET', url: `${API_BASE_URL}/scholar/google-scholar`, description: 'Get Google Scholar articles' },
    
    // User endpoints (these require authentication)
    { method: 'POST', url: `${API_BASE_URL}/users/register`, description: 'Register user', body: { name: 'Test User', email: 'test@example.com', password: 'password123' } },
    { method: 'POST', url: `${API_BASE_URL}/users/login`, description: 'Login user', body: { email: 'test@example.com', password: 'password123' } },
];

console.log('API Endpoints to test:');
testEndpoints.forEach((endpoint, index) => {
    console.log(`${index + 1}. ${endpoint.method} ${endpoint.url} - ${endpoint.description}`);
});

console.log('\nTo test these endpoints:');
console.log('1. Make sure MongoDB is running');
console.log('2. Create a .env file with required environment variables');
console.log('3. Run: npm run dev');
console.log('4. Test endpoints using Postman, curl, or any API testing tool');
