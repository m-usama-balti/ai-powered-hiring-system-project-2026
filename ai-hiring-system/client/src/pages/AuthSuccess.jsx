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
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
                <h1 className="text-2xl font-extrabold text-slate-900">Authenticating...</h1>
                <p className="mt-2 text-sm font-medium text-slate-500">{statusMessage}</p>
            </div>
        </div>
    );
};

export default AuthSuccess;
