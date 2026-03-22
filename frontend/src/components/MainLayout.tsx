import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
            <Header />
            <main className="flex-1 pt-header">
                <Outlet />
            </main>
            <Footer />
            <BottomNav />
        </div>
    );
}
