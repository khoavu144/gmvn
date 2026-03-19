import nodemailer from 'nodemailer';
import { getEnv } from '../config/env';

const env = getEnv();

// Configure the SMTP transporter. Add these to .env:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const emailService = {
    async sendVerificationEmail(to: string, code: string) {
        const mailOptions = {
            from: process.env.SMTP_FROM || '"Gymerviet" <noreply@gymerviet.com>',
            to,
            subject: 'Xác thực tài khoản Gymerviet của bạn',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Chào mừng bạn,</h2>
                    <p>Cảm ơn bạn đã đăng ký tài khoản Gymerviet. Mã xác thực email của bạn là:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">${code}</span>
                    </div>
                    <p>Mã này sẽ hết hạn sau 15 phút.</p>
                    <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
                </div>
            `,
        };
        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Email send error:', error);
            // Non-critical, just log for now. In prod, throw or alert.
        }
    },

    async sendPasswordResetEmail(to: string, code: string) {
        const mailOptions = {
            from: process.env.SMTP_FROM || '"Gymerviet" <noreply@gymerviet.com>',
            to,
            subject: 'Đặt lại mật khẩu Gymerviet',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Yêu cầu đặt lại mật khẩu,</h2>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Gymerviet. Mã khôi phục của bạn là:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">${code}</span>
                    </div>
                    <p>Mã này sẽ hết hạn sau 15 phút.</p>
                    <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
                </div>
            `,
        };
        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Email send error:', error);
        }
    }
};
