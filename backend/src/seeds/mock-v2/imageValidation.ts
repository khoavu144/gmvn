import { IMAGE_MANIFEST } from './imageManifest';

export interface ImageValidationResult {
    id: string;
    kind: string;
    url: string;
    ok: boolean;
    status?: number;
    contentType?: string | null;
    error?: string;
}

const uniqueManifest = Array.from(new Map(IMAGE_MANIFEST.map((entry) => [entry.url, entry])).values());

async function requestImage(url: string, method: 'HEAD' | 'GET'): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
        return await fetch(url, {
            method,
            redirect: 'follow',
            signal: controller.signal,
            headers: {
                'user-agent': 'gymerviet-seed-validator/1.0',
                accept: 'image/*,*/*;q=0.8',
            },
        });
    } finally {
        clearTimeout(timer);
    }
}

export async function validateSeedImages(): Promise<ImageValidationResult[]> {
    return Promise.all(uniqueManifest.map(async (entry): Promise<ImageValidationResult> => {
        let response: Response;
        try {
            response = await requestImage(entry.url, 'HEAD');
            if (!response.ok || response.status === 405) {
                response = await requestImage(entry.url, 'GET');
            }
        } catch (error) {
            return {
                id: entry.id,
                kind: entry.kind,
                url: entry.url,
                ok: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }

        const contentType = response.headers.get('content-type');
        const ok = response.ok && !!contentType && contentType.startsWith('image/');
        return {
            id: entry.id,
            kind: entry.kind,
            url: entry.url,
            ok,
            status: response.status,
            contentType,
            error: ok ? undefined : 'Expected a 2xx image response',
        };
    }));
}

export async function validateSeedImagesOrThrow(): Promise<void> {
    const results = await validateSeedImages();
    const failures = results.filter((result) => !result.ok);
    if (failures.length > 0) {
        const lines = failures.map((failure) => `- [${failure.kind}] ${failure.id} :: ${failure.url} :: status=${failure.status ?? 'n/a'} :: content-type=${failure.contentType ?? 'n/a'} :: error=${failure.error ?? 'unknown'}`);
        throw new Error(`Image validation failed:\n${lines.join('\n')}`);
    }
}
