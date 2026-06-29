import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SeekerDashboard from './pages/SeekerDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SeekerJobs from './pages/SeekerJobs';
import Employers from './pages/Employers';
import FindJobs from './pages/FindJobs';
import AboutUs from './pages/AboutUs';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CareerAdvice from './pages/CareerAdvice';
import ResumeBuilder from './pages/ResumeBuilder';
import BrowseJobs from './pages/BrowseJobs';
import Companies from './pages/Companies';
import TermsOfService from './pages/TermsOfService';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthSuccess from './pages/AuthSuccess';
import Blog from './pages/Blog';
import Careers from './pages/Careers';
import CookiePolicy from './pages/CookiePolicy';
import Accessibility from './pages/Accessibility';

function App() {
    return (
        <AuthProvider>
            <Router>
                <MainLayout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/auth" element={<Login />} />
                        <Route path="/seeker" element={<SeekerDashboard />} />
                        <Route path="/seeker/jobs" element={<SeekerJobs />} />
                        <Route path="/recruiter" element={<RecruiterDashboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/jobs" element={<FindJobs />} />
                        <Route path="/employers" element={<Employers />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/career-advice" element={<CareerAdvice />} />
                        <Route path="/resume-builder" element={<ResumeBuilder />} />
                        <Route path="/browse-jobs" element={<BrowseJobs />} />
                        <Route path="/companies" element={<Companies />} />
                        <Route path="/terms" element={<TermsOfService />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
                        <Route path="/auth/success" element={<AuthSuccess />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/careers" element={<Careers />} />
                        <Route path="/cookie-policy" element={<CookiePolicy />} />
                        <Route path="/accessibility" element={<Accessibility />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </MainLayout>
            </Router>
        </AuthProvider>
    );
}

export default App;
