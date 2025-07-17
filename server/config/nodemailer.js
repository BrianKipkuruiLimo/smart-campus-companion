import nodeMailer from 'nodemailer';


const transporter = nodeMailer.createTransport({
    service: 'Gmail', // Use your email service provider
    // host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export default transporter;
 