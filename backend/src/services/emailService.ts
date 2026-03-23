import nodemailer from 'nodemailer';
import { getEnv } from '../config/env';

const DEV_FALLBACK_HOST = 'smtp.ethereal.email';
const DEV_FALLBACK_PORT = 587;
const DEV_FALLBACK_FROM = '"Gymerviet" <noreply@gymerviet.com>';

class EmailService {
    isConfigured() {
        return Boolean(
            process.env.SMTP_HOST &&
            process.env.SMTP_PORT &&
            process.env.SMTP_USER &&
            process.env.SMTP_PASS &&
            process.env.SMTP_FROM
        );
    }

    getDefaultFrom() {
        return process.env.SMTP_FROM || DEV_FALLBACK_FROM;
    }

    private getTransportOptions() {
        const env = getEnv();
        const configured = this.isConfigured();

        if (!configured && env.NODE_ENV === 'production') {
            throw new Error('SMTP transport is not configured');
        }

        return {
            host: process.env.SMTP_HOST || DEV_FALLBACK_HOST,
            port: Number(process.env.SMTP_PORT || DEV_FALLBACK_PORT),
            secure: Number(process.env.SMTP_PORT || DEV_FALLBACK_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        };
    }

    private createTransporter() {
        return nodemailer.createTransport(this.getTransportOptions());
    }

    async sendVerificationEmail(to: string, code: string) {
        const transporter = this.createTransporter();
        await transporter.sendMail({
            from: this.getDefaultFrom(),
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
        });
    }

    async sendPasswordResetEmail(to: string, code: string) {
        const transporter = this.createTransporter();
        await transporter.sendMail({
            from: this.getDefaultFrom(),
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
        });
    }
}

export const emailService = new EmailService();
