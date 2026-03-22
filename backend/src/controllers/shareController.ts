import { Request, Response } from 'express';
import axios from 'axios';
import { Resvg } from '@resvg/resvg-js';
import { AppDataSource } from '../config/database';
import { getEnv } from '../config/env';
import { TrainerProfile } from '../entities/TrainerProfile';
import { User } from '../entities/User';
import { profileService } from '../services/profileService';
import { userService } from '../services/userService';

type ShareKind = 'coach' | 'athlete';

type BasicShareUser = {
    id: string;
    slug: string | null;
    user_type: 'trainer' | 'athlete';
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    specialties: string[] | null;
    base_price_monthly?: number | null;
    is_verified: boolean;
    created_at?: string | Date;
};

interface ShareProfileData {
    kind: ShareKind;
    name: string;
    headline: string;
    description: string;
    location: string | null;
    avatarUrl: string | null;
    specialties: string[];
    tagline: string | null;
    yearsExperience: number | null;
    isVerified: boolean;
    badgeLabel: string;
    ctaLabel: string;
    canonicalUrl: string;
    shareUrl: string;
    imageUrl: string;
    title: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeUrl(url: string): string {
    return url.replace(/\/$/, '');
}

function isUuid(value: string): boolean {
    return UUID_RE.test(value);
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&' + 'amp;')
        .replace(/</g, '&' + 'lt;')
        .replace(/>/g, '&' + 'gt;')
        .replace(/"/g, '&' + 'quot;')
        .replace(/'/g, '&' + '#39;');
}

function escapeAttr(value: string): string {
    return escapeHtml(value).replace(/`/g, '&#96;');
}

function compactText(value: string | null | undefined): string {
    return (value ?? '').replace(/\s+/g, ' ').trim();
}

function summarizeText(value: string | null | undefined, maxLength: number): string {
    const compact = compactText(value);
    if (!compact) return '';
    if (compact.length <= maxLength) return compact;
    return `${compact.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function wrapText(value: string, maxCharsPerLine: number, maxLines: number): string[] {
    const words = compactText(value).split(' ').filter(Boolean);
    if (!words.length) return [];

    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (candidate.length <= maxCharsPerLine || !currentLine) {
            currentLine = candidate;
            continue;
        }

        lines.push(currentLine);
        currentLine = word;

        if (lines.length === maxLines) break;
    }

    if (currentLine && lines.length < maxLines) {
        lines.push(currentLine);
    }

    if (lines.length > maxLines) {
        lines.length = maxLines;
    }

    if (words.join(' ').length > lines.join(' ').length) {
        const lastIndex = lines.length - 1;
        lines[lastIndex] = `${lines[lastIndex].replace(/[\s.,;:!?-]+$/g, '')}…`;
    }

    return lines;
}

function toInitials(name: string): string {
    return compactText(name)
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || 'GV';
}

function matchesKind(kind: ShareKind, userType: string | undefined): boolean {
    return kind === 'coach' ? userType === 'trainer' : userType === 'athlete';
}

function getBadgeLabel(kind: ShareKind): string {
    return kind === 'coach' ? 'Coach GYMERVIET' : 'Athlete GYMERVIET';
}

function getCtaLabel(kind: ShareKind): string {
    return kind === 'coach' ? 'Xem hồ sơ & nhắn tin tư vấn' : 'Xem hành trình & thành tích';
}

function getDefaultDescription(kind: ShareKind, name: string): string {
    return kind === 'coach'
        ? `Khám phá hồ sơ huấn luyện viên ${name} trên GYMERVIET.`
        : `Khám phá hành trình tập luyện và thành tích của ${name} trên GYMERVIET.`;
}

function buildTitle(kind: ShareKind, name: string): string {
    return kind === 'coach'
        ? `${name} | Coach Profile | GYMERVIET`
        : `${name} | Athlete Profile | GYMERVIET`;
}

function getBackendBaseUrl(req: Request): string {
    const fromEnv = process.env.PUBLIC_BACKEND_URL ? normalizeUrl(process.env.PUBLIC_BACKEND_URL) : null;
    if (fromEnv) return fromEnv;
    return `${req.protocol}://${req.get('host')}`;
}

function buildUrls(kind: ShareKind, identifier: string, req: Request) {
    const backendBaseUrl = normalizeUrl(getBackendBaseUrl(req));
    const frontendBaseUrl = normalizeUrl(getEnv().FRONTEND_URL);
    const encodedIdentifier = encodeURIComponent(identifier);
    const canonicalPath = kind === 'coach'
        ? (isUuid(identifier) ? `/coaches/${encodedIdentifier}` : `/coach/${encodedIdentifier}`)
        : (isUuid(identifier) ? `/athletes/${encodedIdentifier}` : `/athlete/${encodedIdentifier}`);
    const sharePath = `/share/${kind}/${encodedIdentifier}`;

    return {
        canonicalUrl: `${frontendBaseUrl}${canonicalPath}`,
        shareUrl: `${backendBaseUrl}${sharePath}`,
        imageUrl: `${backendBaseUrl}${sharePath}/og.png`,
    };
}

function estimateChipWidth(label: string): number {
    return Math.min(320, Math.max(124, 44 + label.length * 11));
}

async function fetchAvatarDataUri(url: string | null | undefined): Promise<string | null> {
    if (!url) return null;

    try {
        const response = await axios.get<ArrayBuffer>(url, {
            responseType: 'arraybuffer',
            timeout: 5000,
        });
        const contentType = String(response.headers['content-type'] || 'image/jpeg');
        const base64 = Buffer.from(response.data).toString('base64');
        return `data:${contentType};base64,${base64}`;
    } catch {
        return null;
    }
}

async function resolveProfileEntity(kind: ShareKind, identifier: string): Promise<TrainerProfile | null> {
    if (isUuid(identifier)) {
        const profile = await profileService.getPublicProfile(identifier);
        if (profile && matchesKind(kind, profile.trainer?.user_type)) {
            return profile;
        }
        return null;
    }

    const profile = await profileService.getProfileBySlug(identifier);
    if (!profile || !profile.is_profile_public) {
        return null;
    }

    return matchesKind(kind, profile.trainer?.user_type) ? profile : null;
}

function mapUserEntity(user: User, slugOverride?: string | null): BasicShareUser | null {
    if (user.user_type !== 'trainer' && user.user_type !== 'athlete') {
        return null;
    }

    return {
        id: user.id,
        slug: slugOverride ?? user.slug ?? null,
        user_type: user.user_type,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        specialties: user.specialties,
        base_price_monthly: user.base_price_monthly,
        is_verified: user.is_verified,
        created_at: user.created_at,
    };
}

async function resolveFallbackUser(kind: ShareKind, identifier: string): Promise<BasicShareUser | null> {
    try {
        if (isUuid(identifier)) {
            const user = await AppDataSource.getRepository(User).findOneBy({ id: identifier });
            const mappedUser = user ? mapUserEntity(user) : null;
            return mappedUser && matchesKind(kind, mappedUser.user_type) ? mappedUser : null;
        }

        const user = await userService.getUserBySlug(identifier);
        let mappedUser: BasicShareUser | null = null;

        if (user && (user.user_type === 'trainer' || user.user_type === 'athlete')) {
            mappedUser = {
                id: user.id,
                slug: user.slug ?? null,
                user_type: user.user_type,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                bio: user.bio,
                specialties: user.specialties,
                base_price_monthly: user.base_price_monthly,
                is_verified: user.is_verified,
                created_at: user.created_at,
            };
        }

        return mappedUser && matchesKind(kind, mappedUser.user_type) ? mappedUser : null;
    } catch {
        return null;
    }
}

function mapFromProfile(kind: ShareKind, identifier: string, req: Request, profile: TrainerProfile): ShareProfileData {
    const user = profile.trainer;
    const resolvedIdentifier = profile.slug ?? user.slug ?? identifier;
    const headline = compactText(profile.headline)
        || compactText(profile.profile_tagline)
        || compactText(user.specialties?.join(' · '))
        || (kind === 'coach' ? 'Huấn luyện viên trên GYMERVIET' : 'Vận động viên trên GYMERVIET');
    const description = summarizeText(
        profile.bio_short
        || profile.bio_long
        || user.bio
        || headline,
        160,
    ) || getDefaultDescription(kind, user.full_name);
    const urls = buildUrls(kind, resolvedIdentifier, req);

    return {
        kind,
        name: user.full_name,
        headline,
        description,
        location: profile.location,
        avatarUrl: user.avatar_url,
        specialties: Array.isArray(user.specialties) ? user.specialties.slice(0, 3) : [],
        tagline: profile.profile_tagline,
        yearsExperience: profile.years_experience,
        isVerified: Boolean(user.is_verified),
        badgeLabel: getBadgeLabel(kind),
        ctaLabel: getCtaLabel(kind),
        canonicalUrl: urls.canonicalUrl,
        shareUrl: urls.shareUrl,
        imageUrl: urls.imageUrl,
        title: buildTitle(kind, user.full_name),
    };
}

function mapFromUser(kind: ShareKind, identifier: string, req: Request, user: BasicShareUser): ShareProfileData {
    const resolvedIdentifier = user.slug ?? identifier;
    const headline = compactText(user.specialties?.join(' · '))
        || (kind === 'coach' ? 'Huấn luyện viên trên GYMERVIET' : 'Vận động viên trên GYMERVIET');
    const description = summarizeText(user.bio || headline, 160) || getDefaultDescription(kind, user.full_name);
    const urls = buildUrls(kind, resolvedIdentifier, req);

    return {
        kind,
        name: user.full_name,
        headline,
        description,
        location: null,
        avatarUrl: user.avatar_url,
        specialties: Array.isArray(user.specialties) ? user.specialties.slice(0, 3) : [],
        tagline: null,
        yearsExperience: null,
        isVerified: Boolean(user.is_verified),
        badgeLabel: getBadgeLabel(kind),
        ctaLabel: getCtaLabel(kind),
        canonicalUrl: urls.canonicalUrl,
        shareUrl: urls.shareUrl,
        imageUrl: urls.imageUrl,
        title: buildTitle(kind, user.full_name),
    };
}

async function getShareProfile(kind: ShareKind, identifier: string, req: Request): Promise<ShareProfileData | null> {
    const profile = await resolveProfileEntity(kind, identifier);
    if (profile) {
        return mapFromProfile(kind, identifier, req, profile);
    }

    const user = await resolveFallbackUser(kind, identifier);
    if (user) {
        return mapFromUser(kind, identifier, req, user);
    }

    return null;
}

function buildChipMarkup(x: number, y: number, label: string, palette: { chipBg: string; chipText: string }): string {
    const width = estimateChipWidth(label);
    return `
        <g transform="translate(${x} ${y})">
            <rect width="${width}" height="44" rx="22" fill="${palette.chipBg}" />
            <text x="22" y="29" fill="${palette.chipText}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="600">${escapeHtml(label)}</text>
        </g>
    `;
}

function buildOgSvg(data: ShareProfileData, avatarDataUri: string | null): string {
    const isCoach = data.kind === 'coach';
    const palette = isCoach
        ? {
            bg: '#0f172a',
            panel: '#111827',
            text: '#f8fafc',
            muted: '#cbd5e1',
            subtle: '#94a3b8',
            accent: '#f8fafc',
            accentText: '#0f172a',
            chipBg: 'rgba(248,250,252,0.12)',
            chipText: '#e2e8f0',
            badgeBg: 'rgba(255,255,255,0.10)',
            badgeText: '#f8fafc',
            line: 'rgba(255,255,255,0.08)',
            circle: '#1f2937',
        }
        : {
            bg: '#f4f4f5',
            panel: '#ffffff',
            text: '#111827',
            muted: '#475467',
            subtle: '#667085',
            accent: '#14532d',
            accentText: '#f0fdf4',
            chipBg: '#e4efe9',
            chipText: '#14532d',
            badgeBg: '#e5e7eb',
            badgeText: '#111827',
            line: '#e4e7ec',
            circle: '#dbe4dd',
        };

    const nameLines = wrapText(data.name, 18, 2);
    const headlineLines = wrapText(data.headline, 34, 2);
    const descriptionLines = wrapText(data.description, 46, 3);
    const metaLabels = [
        data.location,
        data.specialties[0],
        data.yearsExperience ? `${data.yearsExperience}+ năm kinh nghiệm` : null,
    ].filter(Boolean).slice(0, 2) as string[];

    const badgeIcon = data.isVerified ? ' • Đã xác minh' : '';
    const avatarMarkup = avatarDataUri
        ? `
            <circle cx="930" cy="272" r="152" fill="${palette.circle}" />
            <defs>
                <clipPath id="avatar-clip">
                    <circle cx="930" cy="272" r="140" />
                </clipPath>
            </defs>
            <image href="${avatarDataUri}" x="790" y="132" width="280" height="280" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatar-clip)" />
        `
        : `
            <circle cx="930" cy="272" r="152" fill="${palette.circle}" />
            <circle cx="930" cy="272" r="140" fill="${isCoach ? '#1e293b' : '#dce5dd'}" />
            <text x="930" y="295" text-anchor="middle" fill="${palette.text}" font-family="Arial, Helvetica, sans-serif" font-size="96" font-weight="800">${escapeHtml(toInitials(data.name))}</text>
        `;

    const chipMarkup = metaLabels.map((label, index) => buildChipMarkup(72 + index * 260, 564, label, palette)).join('');
    const sideHeadline = data.kind === 'coach'
        ? 'Sẵn sàng đồng hành cùng mục tiêu của bạn'
        : 'Hành trình thật được kể bằng kết quả thật';
    const sideDescription = data.tagline
        ? summarizeText(data.tagline, 48)
        : data.kind === 'coach'
            ? 'Khám phá hồ sơ và nhắn tin tư vấn trực tiếp.'
            : 'Xem thành tích, hành trình và dấu mốc luyện tập.';

    return `
        <svg width="1200" height="800" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="1200" height="800" fill="${palette.bg}" rx="36" />
            <rect x="720" y="0" width="480" height="800" fill="${palette.panel}" rx="0" />
            <rect x="72" y="120" width="1" height="560" fill="${palette.line}" opacity="0.9" />

            <rect x="104" y="76" width="240" height="40" rx="20" fill="${palette.badgeBg}" />
            <text x="128" y="102" fill="${palette.badgeText}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700">${escapeHtml(data.badgeLabel + badgeIcon)}</text>

            <text x="104" y="200" fill="${palette.text}" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="800" letter-spacing="-1.4">
                ${nameLines.map((line, index) => `<tspan x="104" dy="${index === 0 ? 0 : 78}">${escapeHtml(line)}</tspan>`).join('')}
            </text>

            <text x="104" y="364" fill="${palette.muted}" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="600">
                ${headlineLines.map((line, index) => `<tspan x="104" dy="${index === 0 ? 0 : 40}">${escapeHtml(line)}</tspan>`).join('')}
            </text>

            <text x="104" y="470" fill="${palette.subtle}" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="500">
                ${descriptionLines.map((line, index) => `<tspan x="104" dy="${index === 0 ? 0 : 34}">${escapeHtml(line)}</tspan>`).join('')}
            </text>

            ${chipMarkup}

            <rect x="104" y="662" width="348" height="58" rx="29" fill="${palette.accent}" />
            <text x="132" y="698" fill="${palette.accentText}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">${escapeHtml(data.ctaLabel)}</text>

            ${avatarMarkup}

            <text x="930" y="474" text-anchor="middle" fill="${palette.text}" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700">${escapeHtml(sideHeadline)}</text>
            <text x="930" y="516" text-anchor="middle" fill="${palette.subtle}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="500">${escapeHtml(sideDescription)}</text>

            <text x="1096" y="732" text-anchor="end" fill="${palette.subtle}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" letter-spacing="2">GYMERVIET</text>
            <text x="1096" y="764" text-anchor="end" fill="${palette.subtle}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="500">Open Graph 1200×800 · 3:2</text>
        </svg>
    `;
}

function renderShareHtml(data: ShareProfileData): string {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8" />
    <title>${escapeHtml(data.title)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeAttr(data.description)}" />
    <link rel="canonical" href="${escapeAttr(data.canonicalUrl)}" />
    <meta property="og:type" content="profile" />
    <meta property="og:title" content="${escapeAttr(data.title)}" />
    <meta property="og:description" content="${escapeAttr(data.description)}" />
    <meta property="og:url" content="${escapeAttr(data.shareUrl)}" />
    <meta property="og:image" content="${escapeAttr(data.imageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeAttr(data.imageUrl)}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="800" />
    <meta property="og:image:alt" content="${escapeAttr(data.name)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(data.title)}" />
    <meta name="twitter:description" content="${escapeAttr(data.description)}" />
    <meta name="twitter:image" content="${escapeAttr(data.imageUrl)}" />
    <meta http-equiv="refresh" content="0;url=${escapeAttr(data.canonicalUrl)}" />
    <style>
        body { margin: 0; font-family: Arial, Helvetica, sans-serif; background: #101828; color: #f8fafc; min-height: 100vh; display: grid; place-items: center; }
        .share-shell { text-align: center; padding: 32px; max-width: 520px; }
        .share-shell a { color: #f8fafc; font-weight: 700; }
        .share-shell p { color: rgba(248,250,252,0.72); }
    </style>
</head>
<body>
    <main class="share-shell">
        <h1>${escapeHtml(data.title)}</h1>
        <p>Đang chuyển hướng đến hồ sơ chính. Nếu trình duyệt không tự chuyển, bấm vào liên kết bên dưới.</p>
        <p><a href="${escapeAttr(data.canonicalUrl)}">Mở hồ sơ trên GYMERVIET</a></p>
    </main>
</body>
</html>`;
}

async function sendSharePage(kind: ShareKind, req: Request, res: Response): Promise<void> {
    const identifier = String(req.params.identifier || '');
    const data = await getShareProfile(kind, identifier, req);

    if (!data) {
        res.status(404).type('text/plain').send('Share profile not found');
        return;
    }

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.type('html').send(renderShareHtml(data));
}

async function sendShareImage(kind: ShareKind, req: Request, res: Response): Promise<void> {
    const identifier = String(req.params.identifier || '');
    const data = await getShareProfile(kind, identifier, req);

    if (!data) {
        res.status(404).type('text/plain').send('Share image not found');
        return;
    }

    const avatarDataUri = await fetchAvatarDataUri(data.avatarUrl);
    const svg = buildOgSvg(data, avatarDataUri);
    const pngBuffer = Buffer.from(new Resvg(svg, {
        fitTo: {
            mode: 'width',
            value: 1200,
        },
    }).render().asPng());

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Content-Type', 'image/png');
    res.send(pngBuffer);
}

export const getCoachSharePage = async (req: Request, res: Response) => {
    await sendSharePage('coach', req, res);
};

export const getCoachShareImage = async (req: Request, res: Response) => {
    await sendShareImage('coach', req, res);
};

export const getAthleteSharePage = async (req: Request, res: Response) => {
    await sendSharePage('athlete', req, res);
};

export const getAthleteShareImage = async (req: Request, res: Response) => {
    await sendShareImage('athlete', req, res);
};
