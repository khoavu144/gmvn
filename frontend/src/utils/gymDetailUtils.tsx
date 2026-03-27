import { Link } from 'react-router-dom';
import type { GymBranch, GymCenter, GymGallery, GymTaxonomyTerm } from '../types';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const TODAY_KEY = DAY_KEYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

export function getTaxonomyLabels(gym: GymCenter | null, type: GymTaxonomyTerm['term_type'], limit = 3) {
    if (!gym?.taxonomy_terms) return [];
    const values = gym.taxonomy_terms
        .map((item) => item.term)
        .filter((term): term is GymTaxonomyTerm => term != null && term.term_type === type)
        .map((term) => term.label);

    return Array.from(new Set(values)).slice(0, limit);
}

export function getPrimaryVenueLabel(gym: GymCenter | null) {
    const primary = gym?.taxonomy_terms?.find((item) => item.is_primary && item.term)?.term;
    return primary?.label || gym?.primary_venue_type_slug || 'Active Space';
}

export function getFallbackGallery(gym: GymCenter | null, branchId?: string | null): GymGallery[] {
    const imageUrl = gym?.listing_thumbnail?.image_url || gym?.cover_image_url || gym?.logo_url;
    if (!imageUrl || !gym) return [];

    return [
        {
            id: 'gym-cover-fallback',
            branch_id: branchId || 'fallback',
            image_url: imageUrl,
            caption: gym.name,
            image_type: 'other',
            order_number: 0,
            media_role: 'hero',
            is_hero: true,
        },
    ];
}

export function normalizePhone(raw?: string | null) {
    return (raw || '').replace(/[^\d+]/g, '');
}

export function buildWhatsappUrl(phone?: string | null, message?: string | null) {
    const normalized = normalizePhone(phone).replace(/^0/, '84');
    if (!normalized) return null;
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${normalized}${text}`;
}

export function getTodayHours(branch: GymBranch | null) {
    return branch?.opening_hours?.[TODAY_KEY] as { open?: string; close?: string; is_closed?: boolean } | undefined;
}

export function resolveLeadRoute(gym: GymCenter | null, branch: GymBranch | null) {
    const routes = branch?.lead_routes || [];
    const preferred = routes.find((route) => route.inquiry_type === gym?.default_primary_cta)
        || routes.find((route) => route.inquiry_type === 'consultation')
        || routes[0]
        || null;

    if (!preferred && !branch) {
        return {
            href: '/messages',
            label: 'Nhắn tư vấn',
            isExternal: false,
            helper: 'Tư vấn phù hợp mục tiêu và khu vực',
        };
    }

    const phone = preferred?.phone || branch?.consultation_phone || branch?.phone || null;
    const whatsapp = preferred?.whatsapp || branch?.whatsapp_number || null;
    const messengerUrl = preferred?.messenger_url || branch?.messenger_url || null;
    const email = preferred?.email || branch?.email || null;
    const message = preferred?.auto_prefill_message || `Xin chào, tôi muốn nhận tư vấn về ${branch?.branch_name || gym?.name || 'venue'} trên Gymerviet.`;

    if ((preferred?.primary_channel === 'whatsapp' || !preferred?.primary_channel) && whatsapp) {
        return {
            href: buildWhatsappUrl(whatsapp, message) || '/messages',
            label: 'Nhắn WhatsApp',
            isExternal: true,
            helper: 'Trao đổi trực tiếp với chi nhánh',
        };
    }

    if (preferred?.primary_channel === 'phone' && phone) {
        return {
            href: `tel:${normalizePhone(phone)}`,
            label: 'Gọi tư vấn',
            isExternal: true,
            helper: 'Gọi trực tiếp cho chi nhánh',
        };
    }

    if (preferred?.primary_channel === 'messenger' && messengerUrl) {
        return {
            href: messengerUrl,
            label: 'Mở Messenger',
            isExternal: true,
            helper: 'Chat nhanh với venue',
        };
    }

    if (preferred?.primary_channel === 'email' && email) {
        return {
            href: `mailto:${email}`,
            label: 'Gửi email',
            isExternal: true,
            helper: 'Nhận báo giá qua email',
        };
    }

    if (phone) {
        return {
            href: `tel:${normalizePhone(phone)}`,
            label: 'Gọi tư vấn',
            isExternal: true,
            helper: 'Tư vấn đúng chi nhánh đang chọn',
        };
    }

    if (messengerUrl) {
        return {
            href: messengerUrl,
            label: 'Nhắn Messenger',
            isExternal: true,
            helper: 'Hỏi nhanh về lịch và giá',
        };
    }

    return {
        href: '/messages',
        label: 'Nhắn tư vấn',
        isExternal: false,
        helper: 'Tư vấn phù hợp mục tiêu tập luyện',
    };
}

export function renderActionButton(action: { href: string; label: string; isExternal: boolean }, className: string) {
    if (action.isExternal) {
        return (
            <a href={action.href} target={action.href.startsWith('http') ? '_blank' : undefined} rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined} className={className}>
                {action.label}
            </a>
        );
    }

    return <Link to={action.href} className={className}>{action.label}</Link>;
}

export function SummaryPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-[color:var(--mk-line)] bg-white/75 px-4 py-3 shadow-[0_10px_28px_rgba(53,41,26,0.04)]">
            <div className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[color:var(--mk-muted)]">{label}</div>
            <div className="mt-1 text-sm font-bold text-[color:var(--mk-text)]">{value}</div>
        </div>
    );
}

export function OverviewMetaRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-row items-baseline justify-between gap-3 border-b border-[color:var(--mk-line)] py-2 last:border-b-0">
            <span className="shrink-0 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">{label}</span>
            <span className="min-w-0 truncate text-right text-sm font-semibold text-[color:var(--mk-text)]">{value}</span>
        </div>
    );
}
