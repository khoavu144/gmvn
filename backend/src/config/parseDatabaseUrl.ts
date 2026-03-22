import { Client, ClientConfig } from 'pg';

/**
 * Trim and strip a single pair of surrounding ASCII quotes (dotenv sometimes leaves them).
 */
export const normalizeDatabaseUrl = (raw: string): string => {
    let s = raw.trim();
    if (
        (s.startsWith('"') && s.endsWith('"') && s.length >= 2) ||
        (s.startsWith("'") && s.endsWith("'") && s.length >= 2)
    ) {
        s = s.slice(1, -1).trim();
    }
    if (/\r|\n/.test(s)) {
        throw new Error(
            'DATABASE_URL must be one line with no line breaks. Check backend/.env or repo-root .env.'
        );
    }
    return s;
};

const invalidUrlHint =
    'DATABASE_URL is not a valid Postgres URI. Fixes: (1) If the password has @ # : % [ ] or spaces, URL-encode it (e.g. @ → %40, [ → %5B, ] → %5D). ' +
    '(2) Replace placeholders like [YOUR-PASSWORD] with the real password (no square brackets). ' +
    '(3) Use postgresql://user:password@host:5432/dbname — see backend/env.supabase.example.';

/**
 * Builds a pg Client; turns "Invalid URL" into an actionable error (password/placeholder issues).
 */
export const createPgClient = (config: ClientConfig): Client => {
    try {
        return new Client(config);
    } catch (e: unknown) {
        if (e instanceof TypeError && /invalid url/i.test(String(e.message))) {
            throw new Error(invalidUrlHint);
        }
        throw e;
    }
};
