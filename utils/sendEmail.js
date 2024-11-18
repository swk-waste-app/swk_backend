import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER, 
            pass: process.env.MAIL_PASS_KEY  
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
