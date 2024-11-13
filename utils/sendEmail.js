import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'frankkoomson1@gmail.com', 
            pass: process.env.MAIL_PASS  
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
