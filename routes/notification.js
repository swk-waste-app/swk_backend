import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/notification.js';

const notificationRouter = Router();

notificationRouter.get('/', isAuthenticated, getMyNotifications);
notificationRouter.patch('/read-all', isAuthenticated, markAllNotificationsRead);
notificationRouter.patch('/:id/read', isAuthenticated, markNotificationRead);

export default notificationRouter;
