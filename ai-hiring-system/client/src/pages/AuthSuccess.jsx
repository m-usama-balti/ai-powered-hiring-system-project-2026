import { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { socialLogin } = useContext(AuthContext);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            socialLogin(token);
            navigate('/seeker'); // Or wherever you want to redirect after login
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, socialLogin]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Authenticating...</h1>
                <p>Please wait while we log you in.</p>
            </div>
        </div>
    );
};

export default AuthSuccess;
