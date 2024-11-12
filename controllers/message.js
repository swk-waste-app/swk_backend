import { MessageModel } from '../models/message.js';
import { sendEmail } from '../utils/sendEmail.js';

export const sendMessageToAdmin = async (req, res, next) => {
    try {
        const { subject, message } = req.body;
        const email = req.user.email; // Assuming the user's email is stored in req.user after authentication

        // Save the message to the database
        const newMessage = await MessageModel.create({
            user: req.user.id,
            subject,
            message,
            email
        });

        // Send an email to the admin
        const adminEmail = process.env.ADMIN_EMAIL; // Store admin email in .env
        await sendEmail(adminEmail, subject, `${message}\n\nFrom: ${email}`);

        res.status(201).json({ message: 'Message sent successfully to the admin!' });
    } catch (error) {
        next(error);
    }
};
