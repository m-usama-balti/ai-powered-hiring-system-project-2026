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
        <div className="h-screen w-full flex bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl animate-pulse"></div>
                <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl animate-pulse delay-700"></div>
                <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* LEFT SIDE: Premium Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 h-full">
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-emerald-500/5 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/20 via-emerald-500/20 to-transparent"></div>

                <div className="relative z-10 space-y-12">
                    {/* Logo */}
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 p-2.5 text-white shadow-lg shadow-indigo-500/40 group-hover:shadow-indigo-500/60 transition-smooth">
                            <Briefcase className="h-7 w-7" />
                        </div>
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                            TalentAI
                        </span>
                    </Link>

                    {/* Headline */}
                    <div className="space-y-4">
                        <h1 className="text-5xl lg:text-6xl font-black leading-tight">
                            <span className="text-white block mb-2">Welcome back to</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-blue-400">
                                your AI pipeline.
                            </span>
                        </h1>
                        <p className="text-lg text-slate-300 max-w-md leading-relaxed">
                            Access AI-powered candidate intelligence, predictive analytics, and automated hiring workflows designed for modern teams.
                        </p>
                    </div>

                    {/* Features list */}
                    <div className="space-y-3 pt-8">
                        {[
                            'Real-time AI candidate matching',
                            'Bias-elimination scoring',
                            'Instant resume intelligence'
                        ].map((feature) => (
                            <div key={feature} className="flex items-center gap-3 text-slate-300">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 flex-shrink-0">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                                </div>
                                <span className="text-sm font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-slate-400 text-sm font-medium">
                    © 2026 TalentAI. All rights reserved.
                </div>
            </div>

            {/* RIGHT SIDE: Login Form */}
            <div className="w-full lg:w-1/2 h-full overflow-y-auto flex items-center justify-center p-6">
                <div className="w-full max-w-md animate-fade-in">
                    {/* Card */}
                    <div className="rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 via-slate-800/50 to-slate-900/80 backdrop-blur-xl p-8 shadow-2xl overflow-hidden relative">
                        {/* Background pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 pointer-events-none"></div>

                        <div className="relative z-10 space-y-8">
                            {/* Header */}
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-black text-white">Welcome Back</h2>
                                <p className="text-slate-400 font-medium">Sign in to your account to continue</p>
                            </div>

                            {/* Social Auth Buttons */}
                            <div className="grid grid-cols-3 gap-3">
                                <a href={`${AUTH_BASE_URL}/api/auth/google`} className="group flex justify-center items-center py-3 border border-slate-700/50 rounded-xl bg-slate-700/20 hover:bg-slate-700/40 transition-smooth hover:border-slate-600/50">
                                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                </a>
                                <a href={`${AUTH_BASE_URL}/api/auth/linkedin`} className="group flex justify-center items-center py-3 border border-slate-700/50 rounded-xl bg-slate-700/20 hover:bg-slate-700/40 transition-smooth hover:border-slate-600/50">
                                    <Globe className="w-5 h-5 text-[#0A66C2] group-hover:scale-110 transition-transform" />
                                </a>
                                <a href={`${AUTH_BASE_URL}/api/auth/github`} className="group flex justify-center items-center py-3 border border-slate-700/50 rounded-xl bg-slate-700/20 hover:bg-slate-700/40 transition-smooth hover:border-slate-600/50">
                                    <Code className="w-5 h-5 text-slate-300 group-hover:scale-110 transition-transform" />
                                </a>
                            </div>

                            {/* Divider */}
                            <div className="relative flex items-center gap-4">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Or email</span>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-200">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-slate-700/30 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 transition-smooth focus:border-indigo-500/50 focus:bg-slate-700/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            placeholder="name@company.com"
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-semibold text-slate-200">Password</label>
                                        <Link to="/forgot-password" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-slate-700/30 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 transition-smooth focus:border-indigo-500/50 focus:bg-slate-700/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {/* Error Message */}
                                {errorMessage && (
                                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 animate-fade-in">
                                        <p className="text-sm font-semibold text-red-400">{errorMessage}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full relative bg-gradient-to-r from-indigo-500 to-emerald-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-smooth hover:shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:shadow-indigo-500/30 disabled:hover:translate-y-0 overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center">
                                        {submitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Signing In...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </span>
                                </button>
                            </form>

                            {/* Signup Link */}
                            <p className="text-center text-sm text-slate-400 font-medium">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 font-bold hover:opacity-80 transition-opacity">
                                    Sign up for free
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
