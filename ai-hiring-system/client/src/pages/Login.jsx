import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AUTH_BASE_URL } from '../api/axiosConfig';
import { Briefcase, Mail, Lock, Code, Globe } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage('');

        const result = await login(formData.email.trim(), formData.password);

        if (!result.success) {
            setErrorMessage(result.message || 'Login failed');
            setSubmitting(false);
            return;
        }

        const loggedInUser = result.data;
        if (loggedInUser?.user_type === 'admin') {
            navigate('/admin');
        } else if (loggedInUser?.user_type === 'recruiter') {
            navigate('/recruiter');
        } else {
            navigate('/seeker');
        }
    };

    return (
        <div className="h-screen w-full flex bg-white overflow-hidden">
            {/* LEFT SIDE: AI Graphic & Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 relative overflow-hidden flex-col justify-between p-12 h-full">
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="network" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            <circle cx="50" cy="50" r="2" fill="#fff" />
                            <path d="M50 50L100 0M50 50L0 0M50 50L100 100M50 50L0 100" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                        </pattern>
                        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#312e81" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#glow)" />
                    <rect width="100%" height="100%" fill="url(#network)" />
                </svg>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-white mb-12">
                        <div className="bg-indigo-600 p-2 rounded-xl"><Briefcase className="h-8 w-8" /></div>
                        <span className="text-2xl font-black tracking-tight">TalentAI</span>
                    </div>
                    <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
                        Welcome back to <br /><span className="text-indigo-400">your pipeline.</span>
                    </h1>
                    <p className="text-indigo-200 text-lg max-w-md">
                        Log in to access your AI-powered candidate matches, predictive analytics, and automated workflows.
                    </p>
                </div>

                <div className="relative z-10 text-indigo-300 text-sm font-medium">
                    © 2026 TalentAI. All rights reserved.
                </div>
            </div>

            {/* RIGHT SIDE: Login Form */}
            <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-slate-50">
                <div className="min-h-full flex flex-col items-center justify-center p-8 sm:p-12">
                    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-slate-900">Sign In</h2>
                            <p className="text-slate-500 mt-2 font-medium">Access your dashboard.</p>
                        </div>

                        {/* Social Auth Buttons */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <a href={`${AUTH_BASE_URL}/api/auth/google`} className="flex justify-center items-center py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            </a>
                            <a href={`${AUTH_BASE_URL}/api/auth/linkedin`} className="flex justify-center items-center py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                <Globe className="w-5 h-5 text-[#0A66C2]" />
                            </a>
                            <a href={`${AUTH_BASE_URL}/api/auth/github`} className="flex justify-center items-center py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                <Code className="w-5 h-5 text-slate-900" />
                            </a>
                        </div>

                        <div className="relative flex items-center justify-center mb-8">
                            <hr className="w-full border-slate-200" />
                            <span className="absolute bg-white px-4 text-sm text-slate-400 font-medium">Or log in with email</span>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" placeholder="name@company.com" />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-bold text-slate-700">Password</label>
                                    <Link to="/forgot-password" className="text-sm font-bold text-indigo-600 hover:underline">Forgot Password?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" placeholder="••••••••" />
                                </div>
                            </div>

                            <button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all mt-2 disabled:cursor-not-allowed disabled:opacity-70">
                                {submitting ? 'Signing In...' : 'Sign In'}
                            </button>

                            {errorMessage && (
                                <p className="text-sm font-semibold text-red-600 mt-3">{errorMessage}</p>
                            )}
                        </form>

                        <p className="text-center text-sm text-slate-500 mt-8 font-medium">
                            Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Sign up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
