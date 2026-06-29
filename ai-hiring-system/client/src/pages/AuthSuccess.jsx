import { useEffect, useContext, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { socialLogin } = useContext(AuthContext);
    const [statusMessage, setStatusMessage] = useState('Completing secure sign-in...');

    useEffect(() => {
        const token = searchParams.get('token');

        const completeLogin = async () => {
            if (!token) {
                navigate('/login', { replace: true });
                return;
            }

            const result = await socialLogin(token);
            if (!result.success) {
                setStatusMessage(result.message || 'Unable to complete social sign-in.');
                navigate('/login', { replace: true });
                return;
            }

            const userType = result.data?.user_type;
            const destination = userType === 'admin' ? '/admin' : userType === 'recruiter' ? '/recruiter' : '/seeker';
            navigate(destination, { replace: true });
        };

        completeLogin();
    }, [searchParams, navigate, socialLogin]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="w-full max-w-md rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 text-center shadow-xl shadow-indigo-500/20 relative z-10 animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-indigo-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                </div>
                <h1 className="text-2xl font-black text-white">Authenticating...</h1>
                <p className="mt-2 text-sm font-medium text-slate-400">{statusMessage}</p>
            </div>
        </div>
    );
};

export default AuthSuccess;
