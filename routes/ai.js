import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { isAuthenticated } from '../middlewares/auth.js';
import { aiImageUpload } from '../middlewares/uploads.js';
import { getAiStatus, classifyWaste, chatWithAssistant } from '../controllers/ai.js';

const aiRouter = Router();

// AI calls cost real money per request, so they are rate limited harder
// than ordinary endpoints.
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { message: 'Too many AI requests, please try again in a few minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

aiRouter.get('/status', getAiStatus);
aiRouter.post('/classify', isAuthenticated, aiLimiter, aiImageUpload.single('image'), classifyWaste);
aiRouter.post('/chat', isAuthenticated, aiLimiter, chatWithAssistant);

export default aiRouter;
