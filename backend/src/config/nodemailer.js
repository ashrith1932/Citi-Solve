import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: process.env.NODE_ENV === "production", 
  auth: {
    user: process.env.SMTP_USER,
    pass:process.env.SMTP_PASS,
  },
});

export default transporter;