const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"TaskFlow Pro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - TaskFlow Pro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">TaskFlow Pro</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Secure Task Management</p>
        </div>
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p style="color: #666;">Click the button below to verify your email and activate your account.</p>
        <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 20px 0;">
          Verify Email
        </a>
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `
  });
};

const sendNotificationEmail = async (email, subject, message) => {
  await transporter.sendMail({
    from: `"TaskFlow Pro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `<p>${message}</p>`
  });
};

module.exports = { sendVerificationEmail, sendNotificationEmail };
