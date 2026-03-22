import { useMemo } from 'react';
import {
    ADMIN_NAV_GROUPS,
    ADMIN_TAB_LABELS,
    ADMIN_SECTION_HEADINGS,
    type AdminTab,
} from '../../pages/dashboard/adminNavConfig';

type Props = {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
    children: React.ReactNode;
};

export default function AdminDashboardShell({ activeTab, onTabChange, children }: Props) {
    const heading = ADMIN_SECTION_HEADINGS[activeTab];

    const mobileOptions = useMemo(
        () =>
            ADMIN_NAV_GROUPS.flatMap((g) =>
                g.tabs.map((tab) => ({
                    tab,
                    group: g.title,
                    label: ADMIN_TAB_LABELS[tab],
                }))
            ),
        []
    );

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
            <div className="lg:hidden">
                <label htmlFor="admin-nav-mobile" className="mb-1 block text-xs font-semibold text-gray-600">
                    Khu quản trị
                </label>
                <select
                    id="admin-nav-mobile"
                    className="form-input w-full font-medium"
                    value={activeTab}
                    onChange={(e) => onTabChange(e.target.value as AdminTab)}
                >
                    {mobileOptions.map(({ tab, group, label }) => (
                        <option key={tab} value={tab}>
                            {group} — {label}
                        </option>
                    ))}
                </select>
            </div>

            <nav
                className="hidden w-56 shrink-0 border-r border-gray-200 pr-6 lg:block"
                aria-label="Điều hướng quản trị"
            >
                {ADMIN_NAV_GROUPS.map((group) => (
                    <div key={group.id} className="mb-8 last:mb-0">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {group.title}
                        </p>
                        <ul className="space-y-0.5">
                            {group.tabs.map((tab) => {
                                const selected = activeTab === tab;
                                return (
                                    <li key={tab}>
                                        <button
                                            type="button"
                                            onClick={() => onTabChange(tab)}
                                            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 ${
                                                selected
                                                    ? 'bg-gray-900 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                            aria-current={selected ? 'page' : undefined}
                                        >
                                            {ADMIN_TAB_LABELS[tab]}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="min-w-0 flex-1">
                {activeTab !== 'overview' && (
                    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-gray-100 pb-4">
                        <div>
                            <p className="text-xs text-gray-500">
                                Đang mở:{' '}
                                <span className="font-semibold text-gray-900">{heading.title}</span>
                            </p>
                            {heading.subtitle && (
                                <p className="mt-1 max-w-2xl text-sm text-gray-600">{heading.subtitle}</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => onTabChange('overview')}
                            className="shrink-0 text-sm font-bold text-gray-800 underline-offset-2 hover:underline"
                        >
                            Về tổng quan
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
