/** Query on /dashboard for role user only: ?userTab=journey | shortcuts */

export const USER_TAB_QUERY_KEY = 'userTab';

export type UserDashboardTab = 'journey' | 'shortcuts';

export function parseUserTabParam(raw: string | null): UserDashboardTab {
    return raw === 'shortcuts' ? 'shortcuts' : 'journey';
}
