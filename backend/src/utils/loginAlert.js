import transporter from '../config/nodemailer.js';
import {
    LOGIN_SUCCESS_TEMPLATE,
    TOO_MANY_LOGIN_ATTEMPTS_TEMPLATE,
    TOO_MANY_PASSWORD_ATTEMPTS_TEMPLATE
} from '../config/emailTemplates.js';

const now = () => new Date().toLocaleString();

export const sendLoginSuccessEmail = async ({ email, name, ip }) => {
    await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: '✅ Login Successful',
        html: LOGIN_SUCCESS_TEMPLATE
            .replace('{{name}}', name)
            .replace('{{ip}}', ip)
            .replace('{{time}}', now())
    });
};

export const sendTooManyLoginAttemptsEmail = async ({ email, name, ip }) => {
    await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: '🚨 Too Many Login Attempts',
        html: TOO_MANY_LOGIN_ATTEMPTS_TEMPLATE
            .replace('{{name}}', name)
            .replace('{{ip}}', ip)
            .replace('{{time}}', now())
    });
};

export const sendTooManyPasswordAttemptsEmail = async ({ email, name, ip }) => {
    await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: '🚨 Password Attempts Blocked',
        html: TOO_MANY_PASSWORD_ATTEMPTS_TEMPLATE
            .replace('{{name}}', name)
            .replace('{{ip}}', ip)
            .replace('{{time}}', now())
    });
};