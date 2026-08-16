import { MessageModel } from '../models/message.js';
import { UserModel } from '../models/user.js';
import { sendEmail } from '../utils/sendEmail.js';
import { sendMessageValidator } from '../validators/message.js';

export const sendMessageToAdmin = async (req, res, next) => {
    try {
        const { error, value } = sendMessageValidator.validate(req.body);
        if (error) return res.status(422).json({ message: error.details[0].message });
        const { subject, message } = value;

        const { email } = await UserModel.findById(req.auth.id)
        // Save the message to the database
        await MessageModel.create({
            user: req.auth.id,
            subject,
            message,
            email
        });

        // Send an email to the admin
        const adminEmail = process.env.MAIL_USER; // Store admin email in .env
        await sendEmail(adminEmail, subject, `${message}\n\nFrom: ${email}`);

        res.status(201).json({ message: 'Message sent successfully to the admin!' });
    } catch (error) {
        next(error);
    }
};
