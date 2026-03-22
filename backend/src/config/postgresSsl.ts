/**
 * Supabase (và hầu hết Postgres cloud) bắt buộc SSL khi kết nối từ ngoài,
 * kể cả khi NODE_ENV=development.
 */
export const resolvePostgresSsl = (
    databaseUrl: string,
    nodeEnv: string
): false | { rejectUnauthorized: boolean } => {
    if (nodeEnv === 'production') {
        return { rejectUnauthorized: false };
    }
    const flag = process.env.DATABASE_SSL?.toLowerCase();
    if (flag === 'true' || flag === 'require' || flag === '1') {
        return { rejectUnauthorized: false };
    }
    if (/[?&]sslmode=(require|verify-full|verify-ca)/i.test(databaseUrl)) {
        return { rejectUnauthorized: false };
    }
    if (databaseUrl.toLowerCase().includes('supabase.co')) {
        return { rejectUnauthorized: false };
    }
    return false;
};
