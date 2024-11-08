import { Router } from 'express';
import { fetchGoogleScholarArticles } from '../controllers/googleScholar.js';

const googleScholarRouter = Router();

// Route to fetch Google Scholar articles
googleScholarRouter.get('/google-scholar', fetchGoogleScholarArticles);

export default googleScholarRouter;
