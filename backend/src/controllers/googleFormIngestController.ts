import { Request, Response } from 'express';
import {
    processGoogleFormIngest,
    verifyGoogleFormSignature,
    verifyRequestTimestamp,
    type GoogleFormIngestBody,
} from '../services/googleFormIngestService';

const MAX_SKEW_MS = 5 * 60 * 1000;

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export async function postGoogleFormIngest(req: Request, res: Response): Promise<void> {
    if (!process.env.GOOGLE_FORM_WEBHOOK_SECRET) {
        res.status(503).json({ success: false, error: 'Google Form ingest is not configured' });
        return;
    }

    const rawBody = (req as any).rawBody as Buffer | undefined;
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
        res.status(400).json({ success: false, error: 'Missing raw body' });
        return;
    }

    const sig = req.headers['x-gymerviet-signature'] as string | undefined;
    if (!verifyGoogleFormSignature(rawBody, sig)) {
        res.status(401).json({ success: false, error: 'Invalid signature' });
        return;
    }

    const ts = req.headers['x-gymerviet-timestamp'] as string | undefined;
    if (!verifyRequestTimestamp(ts, MAX_SKEW_MS)) {
        res.status(401).json({ success: false, error: 'Stale or invalid timestamp' });
        return;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(rawBody.toString('utf8'));
    } catch {
        res.status(400).json({ success: false, error: 'Invalid JSON' });
        return;
    }

    if (!isRecord(parsed)) {
        res.status(400).json({ success: false, error: 'Body must be an object' });
        return;
    }

    const body: GoogleFormIngestBody = {
        responseId: String(parsed.responseId ?? '').trim(),
        schemaVersion: String(parsed.schemaVersion ?? '').trim(),
        flow: String(parsed.flow ?? 'profile').trim(),
        email: String(parsed.email ?? '').trim(),
        fullName: parsed.fullName != null ? String(parsed.fullName) : undefined,
        phone: parsed.phone != null ? String(parsed.phone) : undefined,
        consentAccepted: Boolean(parsed.consentAccepted),
        checkedTermSlugs: Array.isArray(parsed.checkedTermSlugs)
            ? parsed.checkedTermSlugs.map((x) => String(x))
            : undefined,
        freeText: isRecord(parsed.freeText)
            ? Object.fromEntries(
                  Object.entries(parsed.freeText).map(([k, v]) => [k, v == null ? '' : String(v)]),
              )
            : undefined,
    };

    if (!body.responseId) {
        res.status(400).json({ success: false, error: 'responseId required' });
        return;
    }

    try {
        const result = await processGoogleFormIngest(rawBody, body);
        const status =
            result.outcome === 'failed' ? 422 : 200;
        res.status(status).json({
            success: result.outcome !== 'failed',
            outcome: result.outcome,
            message: result.message,
            userId: result.userId,
            termCount: result.termCount,
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            error: e instanceof Error ? e.message : 'Server error',
        });
    }
}
