import { AppDataSource } from '../config/database';
import { ProgramReport } from '../entities/ProgramReport';
import { Program } from '../entities/Program';

class QualityGateService {
    private get reportRepo() {
        return AppDataSource.getRepository(ProgramReport);
    }

    private get programRepo() {
        return AppDataSource.getRepository(Program);
    }

    async reportProgram(userId: string, programId: string, reason: string, description: string) {
        let report = await this.reportRepo.findOne({
            where: {
                reporter_id: userId,
                program_id: programId,
                status: 'open'
            }
        });

        if (report) {
            // User already reported this program, increment local count or just ignore
            throw new Error('You have already reported this program.');
        } else {
            report = this.reportRepo.create({
                reporter_id: userId,
                program_id: programId,
                reason,
                description,
            });
            await this.reportRepo.save(report);
        }

        // Check if thresholds are hit
        await this.checkThresholds(programId);

        return report;
    }

    async checkThresholds(programId: string) {
        const reportCount = await this.reportRepo.count({
            where: { program_id: programId, status: 'open' }
        });

        if (reportCount >= 3) {
            const program = await this.programRepo.findOneBy({ id: programId });
            if (program && program.is_published) {
                // Auto hide if >= 3
                program.is_published = false;
                await this.programRepo.save(program);
                console.log(`🛡️ Quality Gate: Program ${programId} auto-hidden due to ${reportCount} reports.`);

                // TODO: Dispatch warning email to creator if >=5
            }
        }
    }
}

export const qualityGateService = new QualityGateService();
