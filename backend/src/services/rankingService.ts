import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { RankingCache } from '../entities/RankingCache';
import { UserPointsHistory } from '../entities/UserPointsHistory';
import { AthleteAchievement } from '../entities/AthleteAchievement';
import cron from 'node-cron';

const userRepo = () => AppDataSource.getRepository(User);
const rankRepo = () => AppDataSource.getRepository(RankingCache);
const pointsRepo = () => AppDataSource.getRepository(UserPointsHistory);
const achievementRepo = () => AppDataSource.getRepository(AthleteAchievement);

// Constants
const MULTIPLIER_MAX = 2.0; // Cap multiplier at 200%
const BATCH_SIZE = 100; // Process rankings in batches

export class RankingService {

    // Scheduled: 1st of every month at midnight UTC
    public scheduleCronJobs() {
        cron.schedule('0 0 1 * *', async () => {
            console.log('🔄 Running monthly decay and seasonal leaderboard reset...');
            try {
                await this.applyMonthlyDecay();
                await this.resetSeasonalLeaderboard();
            } catch (error) {
                console.error('❌ Error in scheduled ranking jobs:', error);
            }
        });
    }

    // Decay activity score by 5% monthly for inactive users (batch processing)
    async applyMonthlyDecay() {
        let skip = 0;
        let processed = 0;

        while (true) {
            const rankings = await rankRepo().find({
                skip,
                take: BATCH_SIZE,
            });

            if (rankings.length === 0) break;

            for (const rank of rankings) {
                // Apply 5% decay to activity score
                const oldActivity = rank.activity_score;
                const newActivity = oldActivity * 0.95; // 5% decay
                rank.activity_score = newActivity;

                // Recalculate Composite
                await this.recalculateComposite(rank.user_id, rank);
                processed++;
            }

            skip += BATCH_SIZE;
        }

        console.log(`✅ Monthly decay applied to ${processed} rankings`);
    }

    async resetSeasonalLeaderboard() {
        const currentDate = new Date();
        const currentMonthStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;

        await AppDataSource.manager.query(
            `UPDATE ranking_cache SET season = $1`,
            [currentMonthStr]
        );
        console.log(`✅ Started new season: ${currentMonthStr}`);
    }

    async addDailyCheckIn(userId: string) {
        // Validate userId
        if (!userId || typeof userId !== 'string') {
            throw new Error('Invalid userId provided');
        }

        // Verify user exists
        const user = await userRepo().findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        let rank = await rankRepo().findOne({ where: { user_id: userId } });
        if (!rank) {
            rank = rankRepo().create({ user_id: userId, activity_score: 10, season: 'all-time' });
            await rankRepo().save(rank); // Save immediately
        }

        // Check if checked in today (UTC timezone)
        const now = new Date();
        const startOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
        const endOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

        const todayCheckin = await pointsRepo().findOne({
            where: {
                user_id: userId,
                reason: 'daily_checkin',
            },
        });

        // Check if today's check-in exists (compare dates in UTC)
        const hasCheckedInToday = todayCheckin &&
            todayCheckin.timestamp >= startOfDayUTC &&
            todayCheckin.timestamp <= endOfDayUTC;

        if (!hasCheckedInToday) {
            await pointsRepo().insert({
                user_id: userId,
                points_change: 1,
                reason: 'daily_checkin',
                timestamp: new Date(),
            });

            rank.activity_score += 1;
            // Cap at 100 raw days equivalent
            if (rank.activity_score > 100) rank.activity_score = 100;

            await this.recalculateComposite(userId, rank);
        }
    }

    async recalculateComposite(userId: string, existingRank?: RankingCache) {
        let rank = existingRank || await rankRepo().findOne({ where: { user_id: userId } });
        if (!rank) {
            rank = rankRepo().create({ user_id: userId });
        }

        // Mock reputation and quality for now until specific features are fleshed out
        const reputation = rank.reputation_score || 10;
        const quality = rank.quality_score || 10;

        // 30-40-30 weights
        const composite = (0.3 * rank.activity_score) + (0.4 * reputation) + (0.3 * quality);
        rank.composite_score = composite;

        // Calculate Multiplier with upper bound
        let multiplier = 1.0;
        const achievements = await achievementRepo().find({ where: { athlete_id: userId, status: 'APPROVED' } });

        if (achievements.length > 0) multiplier *= 1.10; // Verified Athlete (+10%)
        if (achievements.some(a => a.achievement_level === 'NATIONAL')) multiplier *= 1.15;
        if (achievements.some(a => a.achievement_level === 'INTERNATIONAL')) multiplier *= 1.20;

        const goldCount = achievements.filter(a => a.medal_type === 'GOLD').length;
        if (goldCount >= 3) multiplier *= 1.30; // Elite Performer (+30%)

        // Cap multiplier at MULTIPLIER_MAX (2.0 = 200%)
        multiplier = Math.min(multiplier, MULTIPLIER_MAX);

        rank.multiplier = multiplier;
        rank.final_score = composite * multiplier;

        await rankRepo().save(rank);
    }
}

export const rankingService = new RankingService();
// Initialize cron jobs on startup
rankingService.scheduleCronJobs();
