import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-[color:var(--mk-paper)] dark:bg-black">
            <Header />
            <main className="flex-1 pt-header pb-nav lg:pb-0">
                <Outlet />
            </main>
            <Footer />
            <BottomNav />
        </div>
    );
}
