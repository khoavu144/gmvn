import { Outlet } from 'react-router-dom';

import { cn } from '../lib/utils';
import { useRoutePresentation } from '../lib/routePresentation';

import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';

export default function MainLayout() {
    const routePresentation = useRoutePresentation();
    const showHeader = !routePresentation.hideHeader;
    const showFooter = !routePresentation.hideFooter;
    const showBottomNav = !routePresentation.hideBottomNav;

    return (
        <div
            className={cn(
                'min-h-screen flex flex-col bg-gray-50',
                routePresentation.shellType === 'auth' && 'bg-[linear-gradient(180deg,#fafaf9_0%,#f5f5f4_100%)]'
            )}
            data-shell={routePresentation.shellType}
            data-objective={routePresentation.businessObjective}
        >
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded-lg focus:shadow-xl outline-none ring-2 ring-black">Bỏ qua điều hướng</a>
            {showHeader && <Header />}
            <main id="main-content" className={cn('flex-1', showHeader && 'pt-header')}>
                <Outlet />
            </main>
            {showFooter && <Footer />}
            {showBottomNav && <BottomNav />}
        </div>
    );
}
