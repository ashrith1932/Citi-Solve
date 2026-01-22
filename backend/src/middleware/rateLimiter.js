import rateLimit from 'express-rate-limit';
import { sendTooManyLoginAttemptsEmail } from '../utils/loginAlert.js';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: async (req, res) => {

        if (req.body?.email) {
            await sendTooManyLoginAttemptsEmail({
                email: req.body.email,
                name: 'User',
                ip: req.ip
            });
        }

        res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please try later.'
        });
    }
});


export const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 100,
    message: {
        success: false,
        message: 'Too many OTP requests. Please try again after 1 hour.'
    }
});

export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many password reset attempts. Please try again later.'
    }
});