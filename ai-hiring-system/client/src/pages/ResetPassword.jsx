import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axiosConfig';
import { Lock, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
    const { resettoken } = useParams(); // Grabs the token from the URL
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setMessage('');
        try {
            await API.put(`/auth/resetpassword/${resettoken}`, { password });
            setMessage("Password successfully reset! Redirecting to login...");
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="max-w-md w-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl shadow-xl shadow-indigo-500/20 border border-slate-700/50 backdrop-blur-xl p-8 relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white">Set New Password</h2>
                    <p className="text-slate-400 mt-2 font-medium">Please enter your new secure password.</p>
                </div>

                {message ? (
                    <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 font-medium border border-emerald-500/30">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" /> {message}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-xl text-sm font-bold text-center border border-red-500/30">{error}</div>}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input type="password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-white placeholder-slate-500" placeholder="Enter new password" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-emerald-500 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 shadow-lg shadow-indigo-500/20 transition-all">
                            Save Password
                        </button>
                    </form>
                )}

                {error && (
                    <div className="mt-6 text-center">
                        <Link to="/forgot-password" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Request a new link</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
