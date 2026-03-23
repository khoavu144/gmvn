import { AppDataSource } from '../config/database';
import { ProgramReport } from '../entities/ProgramReport';
import { Program } from '../entities/Program';
import nodemailer from 'nodemailer';

// Configuration constants
const REPORT_THRESHOLD = 3; // Auto-hide after 3 reports
const EMAIL_THRESHOLD = 5; // Send warning email after 5 reports

// Email transporter (configure with your email service)
const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
    } : undefined,
});

class QualityGateService {
    private get reportRepo() {
        return AppDataSource.getRepository(ProgramReport);
    }

    private get programRepo() {
        return AppDataSource.getRepository(Program);
    }

    async reportProgram(userId: string, programId: string, reason: string, description: string) {
        // Validate inputs
        if (!userId || !programId || !reason) {
            throw new Error('Missing required fields: userId, programId, reason');
        }

        // Use transaction for data consistency
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check if user already reported this program
            const existingReport = await queryRunner.manager.findOne(ProgramReport, {
                where: {
                    reporter_id: userId,
                    program_id: programId,
                    status: 'open'
                }
            });

            if (existingReport) {
                throw new Error('You have already reported this program.');
            }

            // Create new report
            const report = queryRunner.manager.create(ProgramReport, {
                reporter_id: userId,
                program_id: programId,
                reason,
                description,
            });
            await queryRunner.manager.save(report);

            // Log audit entry
            console.log(`📋 Quality Gate: Report created by ${userId} for program ${programId} (reason: ${reason})`);

            // Check if thresholds are hit
            await this.checkThresholds(programId, queryRunner);

            await queryRunner.commitTransaction();
            return report;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('❌ Error reporting program:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async checkThresholds(programId: string, queryRunner?: any) {
        const manager = queryRunner?.manager || AppDataSource.manager;
        const reportCount = await manager.count(ProgramReport, {
            where: { program_id: programId, status: 'open' }
        });

        const program = await manager.findOneBy(Program, { id: programId });
        if (!program) {
            console.warn(`⚠️ Program ${programId} not found`);
            return;
        }

        // Auto-hide if threshold reached
        if (reportCount >= REPORT_THRESHOLD && program.is_published) {
            program.is_published = false;
            await manager.save(program);
            console.log(`🛡️ Quality Gate: Program ${programId} auto-hidden due to ${reportCount} reports.`);

            // Log audit entry
            await this.logAuditEntry('PROGRAM_AUTO_HIDDEN', programId, `Auto-hidden after ${reportCount} reports`);
        }

        // Send warning email if threshold exceeded
        if (reportCount >= EMAIL_THRESHOLD) {
            await this.sendWarningEmail(program, reportCount);
        }
    }

    private async sendWarningEmail(program: Program, reportCount: number) {
        try {
            // Get program creator info (assuming program has creator_id field)
            const creatorId = (program as any).creator_id;
            if (!creatorId) {
                console.warn(`⚠️ Program ${program.id} has no creator_id`);
                return;
            }

            // In production, fetch creator email from User table
            // For now, using placeholder
            const creatorEmail = `creator-${creatorId}@example.com`;

            const mailOptions = {
                from: process.env.SMTP_FROM || 'noreply@gymerviet.com',
                to: creatorEmail,
                subject: `⚠️ Quality Gate Warning: Your Program "${program.name}" Has Multiple Reports`,
                html: `
                    <h2>Quality Gate Warning</h2>
                    <p>Your program "<strong>${program.name}</strong>" has received <strong>${reportCount}</strong> reports.</p>
                    <p>This program may be at risk of being hidden from the platform if reports continue.</p>
                    <p>Please review the program content and make necessary improvements.</p>
                    <p><a href="${process.env.APP_URL || 'https://gymerviet.com'}/programs/${program.id}">View Program</a></p>
                    <hr>
                    <p><em>This is an automated message from GYMERVIET Quality Gate System</em></p>
                `,
            };

            await emailTransporter.sendMail(mailOptions);
            console.log(`📧 Warning email sent to ${creatorEmail} for program ${program.id}`);

            // Log audit entry
            await this.logAuditEntry('WARNING_EMAIL_SENT', program.id, `Email sent after ${reportCount} reports`);
        } catch (error) {
            console.error('❌ Error sending warning email:', error);
            // Don't throw - email failure shouldn't block the quality gate process
        }
    }

    private async logAuditEntry(action: string, programId: string, details: string) {
        try {
            // Log to console for now
            // In production, save to audit_logs table
            console.log(`[AUDIT] ${new Date().toISOString()} | Action: ${action} | Program: ${programId} | Details: ${details}`);
        } catch (error) {
            console.error('❌ Error logging audit entry:', error);
        }
    }
}

export const qualityGateService = new QualityGateService();
