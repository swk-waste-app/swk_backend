import { Router } from 'express';
import { sendMessageToAdmin } from '../controllers/message.js';
import { isAuthenticated } from '../middlewares/auth.js';

const messageRouter = Router();

// Route to send a message to the admin
messageRouter.post('/send', isAuthenticated, sendMessageToAdmin);

export default messageRouter;
