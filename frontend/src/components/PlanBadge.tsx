import type { PlatformPlan } from '../hooks/usePlatformPlan';

interface PlanBadgeProps {
    plan: PlatformPlan;
    size?: 'sm' | 'md';
}

export default function PlanBadge({ plan: _plan, size: _size = 'sm' }: PlanBadgeProps) {
    return null;
}
