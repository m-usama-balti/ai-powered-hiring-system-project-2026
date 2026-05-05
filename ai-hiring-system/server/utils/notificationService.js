let nodemailer = null;
try {
    nodemailer = require('nodemailer');
} catch (error) {
    nodemailer = null;
}

let transporter = null;

const canSendEmails = () => {
    return (
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS &&
        process.env.EMAIL_FROM
    );
};

const getTransporter = () => {
    if (!nodemailer) return null;
    if (!canSendEmails()) return null;
    if (transporter) return transporter;

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    return transporter;
};

const sendStatusUpdateEmail = async ({ to, jobTitle, status }) => {
    const mailer = getTransporter();
    if (!mailer) {
        console.log(`[Notification] SMTP not configured. Skipping email to ${to} for ${jobTitle} (${status}).`);
        return;
    }

    await mailer.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: `Application Update: ${jobTitle}`,
        text: `Your application status has been updated to: ${status}`
    });
};

module.exports = {
    sendStatusUpdateEmail
};
