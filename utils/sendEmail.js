import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER, // Your email from .env
            pass: process.env.MAIL_PASS  // Your email password from .env
        }
    });

    const mailOptions = {
        from: process.env.MAIL_USER,
        to,
        subject,
        text
    };

    await transporter.sendMail(mailOptions);
};
