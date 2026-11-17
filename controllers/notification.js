import { NotificationModel } from '../models/notification.js';

// Latest notifications for the signed-in user, plus how many are unread.
// One call drives both the bell badge and the dropdown list.
export const getMyNotifications = async (req, res, next) => {
    try {
        const [notifications, unreadCount] = await Promise.all([
            NotificationModel.find({ user: req.auth.id }).sort({ createdAt: -1 }).limit(30),
            NotificationModel.countDocuments({ user: req.auth.id, read: false }),
        ]);
        res.json({ notifications, unreadCount });
    } catch (error) {
        next(error);
    }
};

export const markNotificationRead = async (req, res, next) => {
    try {
        const updated = await NotificationModel.findOneAndUpdate(
            { _id: req.params.id, user: req.auth.id },
            { read: true },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Notification not found' });
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const markAllNotificationsRead = async (req, res, next) => {
    try {
        await NotificationModel.updateMany({ user: req.auth.id, read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};
