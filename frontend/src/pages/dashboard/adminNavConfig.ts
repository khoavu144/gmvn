/**
 * Admin dashboard navigation — URL query `adminTab` on `/dashboard` (role admin only).
 *
 * Allowed values: overview | ops | users | content | gyms | reviews | gallery | coach-apps
 * Example: /dashboard?adminTab=users
 * Omit query or `adminTab=overview` → overview (clean URL uses no query for overview).
 */

export type AdminTab =
    | 'overview'
    | 'ops'
    | 'users'
    | 'content'
    | 'gyms'
    | 'reviews'
    | 'gallery'
    | 'coach-apps';

export const ADMIN_TAB_QUERY_KEY = 'adminTab';

export const ADMIN_TAB_VALUES: readonly AdminTab[] = [
    'overview',
    'ops',
    'users',
    'content',
    'gyms',
    'reviews',
    'gallery',
    'coach-apps',
] as const;

export const DEFAULT_ADMIN_TAB: AdminTab = 'overview';

export function isAdminTab(value: string | null | undefined): value is AdminTab {
    return value !== undefined && value !== null && (ADMIN_TAB_VALUES as readonly string[]).includes(value);
}

export function parseAdminTabParam(raw: string | null): AdminTab {
    if (raw && isAdminTab(raw)) return raw;
    return DEFAULT_ADMIN_TAB;
}

/** Short label for sidebar / mobile select */
export const ADMIN_TAB_LABELS: Record<AdminTab, string> = {
    overview: 'Tổng quan',
    ops: 'Vận hành',
    users: 'Người dùng',
    content: 'Tin tức & sản phẩm',
    gyms: 'Duyệt gym',
    reviews: 'Đánh giá gym',
    gallery: 'Gallery cộng đồng',
    'coach-apps': 'Đơn làm coach',
};

/** Longer title for context bar + SEO-ish headings */
export const ADMIN_SECTION_HEADINGS: Record<AdminTab, { title: string; subtitle?: string }> = {
    overview: { title: 'Tổng quan hệ thống' },
    ops: { title: 'Vận hành & giám sát', subtitle: 'Sức khỏe API, audit, giao dịch, gói platform' },
    users: { title: 'Người dùng', subtitle: 'Danh sách và tìm kiếm tài khoản' },
    content: { title: 'Tin tức & marketplace', subtitle: 'Bài viết admin và kiểm duyệt sản phẩm' },
    gyms: { title: 'Phê duyệt gym', subtitle: 'Hồ sơ gym owner chờ duyệt' },
    reviews: { title: 'Đánh giá gym', subtitle: 'Kiểm duyệt review vi phạm' },
    gallery: { title: 'Gallery cộng đồng', subtitle: 'Quản lý nội dung gallery' },
    'coach-apps': {
        title: 'Đơn đăng ký làm coach',
        subtitle: 'Duyệt hoặc từ chối đơn nâng cấp Athlete → Coach',
    },
};

export type AdminNavGroup = { id: string; title: string; tabs: AdminTab[] };

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
    { id: 'home', title: 'Tổng quan', tabs: ['overview'] },
    {
        id: 'people-content',
        title: 'Người dùng & nội dung',
        tabs: ['users', 'content'],
    },
    {
        id: 'moderation',
        title: 'Kiểm duyệt',
        tabs: ['gyms', 'reviews', 'gallery', 'coach-apps'],
    },
    { id: 'ops', title: 'Vận hành', tabs: ['ops'] },
];
