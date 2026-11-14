import { NotificationModel } from '../models/notification.js';

// Create an in-app notification without ever failing the request that
// triggered it: notifications are best-effort side effects.
export const notify = async (userId, { type = 'system', title, body, link }) => {
    try {
        await NotificationModel.create({ user: userId, type, title, body, link });
    } catch (error) {
        console.error('[notify] failed to create notification:', error.message);
    }
};
