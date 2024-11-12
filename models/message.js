import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    email: { type: String, required: true }
}, {
    timestamps: true
});

export const MessageModel = model('Message', messageSchema);
