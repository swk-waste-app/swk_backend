import { Schema, model } from 'mongoose';
import { toJSON } from '@reis/mongoose-to-json';

const notificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['pickup', 'points', 'badge', 'system'], default: 'system' },
    title: { type: String, required: true },
    body: { type: String },
    // In-app path the frontend navigates to when the notification is clicked.
    link: { type: String },
    read: { type: Boolean, default: false },
}, {
    timestamps: true,
});

notificationSchema.index({ user: 1, createdAt: -1 });
// Old notifications clean themselves up after 60 days.
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

notificationSchema.plugin(toJSON);
export const NotificationModel = model('Notification', notificationSchema);
