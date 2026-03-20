import type { PlatformPlan } from '../hooks/usePlatformPlan';

interface PlanBadgeProps {
    plan: PlatformPlan;
    size?: 'sm' | 'md';
}

const PLAN_STYLES: Record<PlatformPlan, { label: string; bg: string; color: string } | null> = {
    free: null, // no badge for free
    coach_pro: { label: 'PRO', bg: '#111827', color: '#fff' },
    coach_elite: { label: 'ELITE', bg: 'linear-gradient(135deg,#b8860b,#fffacd,#b8860b)', color: '#3b2700' },
    athlete_premium: { label: 'PREMIUM', bg: '#1e3a8a', color: '#fff' },
    gym_business: { label: 'BUSINESS', bg: '#166534', color: '#fff' },
};

export default function PlanBadge({ plan, size = 'sm' }: PlanBadgeProps) {
    const style = PLAN_STYLES[plan];
    if (!style) return null;

    const padding = size === 'sm' ? '2px 7px' : '4px 12px';
    const fontSize = size === 'sm' ? '0.58rem' : '0.68rem';

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding, borderRadius: 999,
            background: style.bg, color: style.color,
            fontSize, fontWeight: 800,
            letterSpacing: '0.1em',
            flexShrink: 0,
            userSelect: 'none',
        }}>
            {style.label}
        </span>
    );
}
