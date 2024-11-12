import { Router } from 'express';
import { sendMessageToAdmin } from '../controllers/message.js';
import { verifyToken } from '../middlewares/auth.js';

const messageRouter = Router();

// Route to send a message to the admin
messageRouter.post('/send', verifyToken, sendMessageToAdmin);

export default messageRouter;
