import crypto from 'crypto';
import { In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { GoogleFormImportLog } from '../entities/GoogleFormImportLog';
import type { Repository } from 'typeorm';
import { User } from '../entities/User';
import { UserProfileTerm } from '../entities/UserProfileTerm';
import { TrainerProfile } from '../entities/TrainerProfile';
import {
    setUserSelections,
    UserProfileCatalogError,
    validateSelections,
} from './userProfileCatalogService';
import type { AppUserType } from '../config/userProfileRules';

const ALLOWED_SCHEMA_VERSIONS = new Set(['1']);

function isUniqueViolation(err: unknown): boolean {
    return Boolean(
        err &&
            typeof err === 'object' &&
            'code' in err &&
            (err as { code?: string }).code === '23505',
    );
}

async function saveImportLog(
    logRepo: Repository<GoogleFormImportLog>,
    row: {
        response_id: string;
        schema_version: string;
        flow: string;
        email: string;
        user_id: string | null;
        status: string;
        outcome_detail: string | null;
        payload: Record<string, unknown>;
        payload_hash: string;
        error_message: string | null;
    },
): Promise<'ok' | 'duplicate'> {
    try {
        await logRepo.save(logRepo.create(row));
        return 'ok';
    } catch (e) {
        if (isUniqueViolation(e)) return 'duplicate';
        throw e;
    }
}

export interface GoogleFormIngestBody {
    responseId: string;
    schemaVersion: string;
    /** Hint for analytics only; server uses DB user_type for catalog rules. */
    flow: string;
    email: string;
    fullName?: string;
    phone?: string;
    consentAccepted: boolean;
    checkedTermSlugs?: string[];
    freeText?: Record<string, string>;
}

export type IngestOutcome =
    | 'duplicate'
    | 'contact_stored'
    | 'no_user'
    | 'processed'
    | 'failed';

export interface IngestResult {
    outcome: IngestOutcome;
    message?: string;
    userId?: string;
    termCount?: number;
}

function sha256Hex(data: string | Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

export function verifyGoogleFormSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
    const secret = process.env.GOOGLE_FORM_WEBHOOK_SECRET;
    if (!secret || !signatureHeader) return false;

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    try {
        const a = Buffer.from(signatureHeader.trim(), 'hex');
        const b = Buffer.from(expected, 'hex');
        if (a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
    } catch {
        return false;
    }
}

export function verifyRequestTimestamp(tsHeader: string | undefined, maxSkewMs: number): boolean {
    if (!tsHeader) return true;
    const t = Number(tsHeader);
    if (!Number.isFinite(t)) return false;
    return Math.abs(Date.now() - t) <= maxSkewMs;
}

async function resolveTermIdsForUserType(
    slugs: string[],
    userType: AppUserType,
): Promise<{ ids: string[]; unknownSlugs: string[] }> {
    const unique = [...new Set(slugs.map((s) => String(s).trim()).filter(Boolean))];
    if (unique.length === 0) return { ids: [], unknownSlugs: [] };

    const termRepo = AppDataSource.getRepository(UserProfileTerm);
    const terms = await termRepo.find({
        where: { slug: In(unique), is_active: true },
        relations: ['section'],
    });

    const bySlug = new Map(terms.map((t) => [t.slug, t]));
    const ids: string[] = [];
    const unknownSlugs: string[] = [];

    for (const slug of unique) {
        const t = bySlug.get(slug);
        if (!t) {
            unknownSlugs.push(slug);
            continue;
        }
        const applies = Array.isArray(t.section.applies_to) ? t.section.applies_to : [];
        if (!applies.includes(userType)) {
            unknownSlugs.push(slug);
            continue;
        }
        ids.push(t.id);
    }

    return { ids: [...new Set(ids)], unknownSlugs };
}

async function maybeAutoPublishProfile(userId: string, userType: AppUserType): Promise<void> {
    if (process.env.GOOGLE_FORM_AUTO_PUBLISH_PROFILE !== 'true') return;
    if (userType !== 'trainer' && userType !== 'athlete') return;

    const repo = AppDataSource.getRepository(TrainerProfile);
    const profile = await repo.findOne({ where: { trainer_id: userId } });
    if (!profile) return;
    await repo.update(profile.id, { is_profile_public: true });
}

export async function processGoogleFormIngest(
    rawBody: Buffer,
    body: GoogleFormIngestBody,
): Promise<IngestResult> {
    const logRepo = AppDataSource.getRepository(GoogleFormImportLog);
    const payloadHash = sha256Hex(rawBody);

    const dup = await logRepo.findOneBy({ response_id: body.responseId });
    if (dup) {
        return { outcome: 'duplicate', message: 'responseId already ingested' };
    }

    if (!ALLOWED_SCHEMA_VERSIONS.has(String(body.schemaVersion))) {
        const ins = await saveImportLog(logRepo, {
            response_id: body.responseId,
            schema_version: String(body.schemaVersion),
            flow: String(body.flow || ''),
            email: String(body.email || '').trim().toLowerCase(),
            user_id: null,
            status: 'failed',
            outcome_detail: 'unsupported_schema',
            payload: body as unknown as Record<string, unknown>,
            payload_hash: payloadHash,
            error_message: 'schemaVersion not allowed',
        });
        if (ins === 'duplicate') return { outcome: 'duplicate', message: 'responseId already ingested' };
        return { outcome: 'failed', message: 'Unsupported schemaVersion' };
    }

    if (!body.consentAccepted) {
        const ins = await saveImportLog(logRepo, {
            response_id: body.responseId,
            schema_version: String(body.schemaVersion),
            flow: String(body.flow || ''),
            email: String(body.email || '').trim().toLowerCase(),
            user_id: null,
            status: 'failed',
            outcome_detail: 'no_consent',
            payload: body as unknown as Record<string, unknown>,
            payload_hash: payloadHash,
            error_message: 'consentRequired',
        });
        if (ins === 'duplicate') return { outcome: 'duplicate', message: 'responseId already ingested' };
        return { outcome: 'failed', message: 'consentRequired' };
    }

    const email = String(body.email || '')
        .trim()
        .toLowerCase();
    if (!email || !email.includes('@')) {
        const ins = await saveImportLog(logRepo, {
            response_id: body.responseId,
            schema_version: String(body.schemaVersion),
            flow: String(body.flow || ''),
            email: email || '(empty)',
            user_id: null,
            status: 'failed',
            outcome_detail: 'invalid_email',
            payload: body as unknown as Record<string, unknown>,
            payload_hash: payloadHash,
            error_message: 'invalid email',
        });
        if (ins === 'duplicate') return { outcome: 'duplicate', message: 'responseId already ingested' };
        return { outcome: 'failed', message: 'invalid email' };
    }

    const flow = String(body.flow || 'profile').toLowerCase();

    if (flow === 'contact') {
        const ins = await saveImportLog(logRepo, {
            response_id: body.responseId,
            schema_version: String(body.schemaVersion),
            flow,
            email,
            user_id: null,
            status: 'contact_only',
            outcome_detail: 'stored',
            payload: body as unknown as Record<string, unknown>,
            payload_hash: payloadHash,
            error_message: null,
        });
        if (ins === 'duplicate') return { outcome: 'duplicate', message: 'responseId already ingested' };
        return { outcome: 'contact_stored' };
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo
        .createQueryBuilder('u')
        .where('LOWER(TRIM(u.email)) = LOWER(TRIM(:email))', { email })
        .getOne();

    if (!user) {
        const ins = await saveImportLog(logRepo, {
            response_id: body.responseId,
            schema_version: String(body.schemaVersion),
            flow,
            email,
            user_id: null,
            status: 'no_user',
            outcome_detail: 'account_not_found',
            payload: body as unknown as Record<string, unknown>,
            payload_hash: payloadHash,
            error_message: null,
        });
        if (ins === 'duplicate') return { outcome: 'duplicate', message: 'responseId already ingested' };
        return { outcome: 'no_user', message: 'No account for this email' };
    }

    const userType = user.user_type as AppUserType;

    const updates: Partial<User> = {};
    if (body.fullName && String(body.fullName).trim()) {
        updates.full_name = String(body.fullName).trim();
    }
    if (Object.keys(updates).length) {
        await userRepo.update(user.id, updates);
    }

    if (body.phone && String(body.phone).trim() && (userType === 'trainer' || userType === 'athlete')) {
        const tpRepo = AppDataSource.getRepository(TrainerProfile);
        const prof = await tpRepo.findOne({ where: { trainer_id: user.id } });
        if (prof) {
            await tpRepo.update(prof.id, { phone: String(body.phone).trim().slice(0, 20) });
        }
    }

    const slugs = Array.isArray(body.checkedTermSlugs) ? body.checkedTermSlugs : [];
    const { ids: termIds, unknownSlugs } = await resolveTermIdsForUserType(slugs, userType);

    try {
        if (termIds.length > 0) {
            await validateSelections(userType, 'profile', termIds);
            await setUserSelections(user.id, userType, 'profile', termIds);
        }

        const noteParts: string[] = [];
        if (unknownSlugs.length) noteParts.push(`ignored_slugs: ${unknownSlugs.join(',')}`);
        if (body.freeText && Object.keys(body.freeText).length) {
            noteParts.push(`freeText_keys: ${Object.keys(body.freeText).join(',')}`);
        }

        const ok = await saveImportLog(logRepo, {
            response_id: body.responseId,
            schema_version: String(body.schemaVersion),
            flow,
            email,
            user_id: user.id,
            status: 'processed',
            outcome_detail: noteParts.join(' | ') || null,
            payload: body as unknown as Record<string, unknown>,
            payload_hash: payloadHash,
            error_message: null,
        });
        if (ok === 'duplicate') return { outcome: 'duplicate', message: 'responseId already ingested' };

        await maybeAutoPublishProfile(user.id, userType);

        return {
            outcome: 'processed',
            userId: user.id,
            termCount: termIds.length,
        };
    } catch (e) {
        const msg = e instanceof UserProfileCatalogError ? e.message : (e as Error).message;
        const ins = await saveImportLog(logRepo, {
            response_id: body.responseId,
            schema_version: String(body.schemaVersion),
            flow,
            email,
            user_id: user.id,
            status: 'failed',
            outcome_detail: 'validation_or_save',
            payload: body as unknown as Record<string, unknown>,
            payload_hash: payloadHash,
            error_message: msg,
        });
        if (ins === 'duplicate') return { outcome: 'duplicate', message: 'responseId already ingested' };
        return { outcome: 'failed', message: msg };
    }
}

export async function listGoogleFormImportLogs(limit: number): Promise<GoogleFormImportLog[]> {
    return AppDataSource.getRepository(GoogleFormImportLog).find({
        order: { created_at: 'DESC' },
        take: Math.min(Math.max(limit, 1), 200),
    });
}
