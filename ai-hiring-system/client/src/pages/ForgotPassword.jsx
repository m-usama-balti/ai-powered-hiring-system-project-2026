import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axiosConfig';
import { Mail, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setMessage('');
        try {
            const { data } = await API.post('/auth/forgotpassword', { email });
            setMessage(data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900">Forgot Password</h2>
                    <p className="text-slate-500 mt-2 font-medium">Enter your email and we'll send you a reset link.</p>
                </div>

                {message ? (
                    <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center gap-3 mb-6 font-medium">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" /> {message}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold text-center">{error}</div>}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" placeholder="name@company.com" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg transition-all disabled:opacity-70">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm font-bold text-indigo-600 hover:underline">Back to Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
