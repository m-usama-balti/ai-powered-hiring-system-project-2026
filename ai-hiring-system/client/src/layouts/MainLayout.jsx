// client/src/layouts/MainLayout.jsx
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isAuthPage = authRoutes.some(route => location.pathname.startsWith(route));

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 pt-16">
            <Navbar />
            <main className="grow bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                {children}
            </main>
            {!isAuthPage && <Footer />}
        </div>
    );
};

export default MainLayout;
