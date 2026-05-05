import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 px-4">
            <div className="max-w-4xl text-center space-y-8">
                <h1 className="text-5xl font-extrabold text-blue-900 tracking-tight">
                    Welcome to the <span className="text-blue-600">AI Hiring System</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Revolutionizing recruitment through Artificial Intelligence. Our platform uses advanced NLP to automatically parse resumes and match top talent with the right opportunities in seconds.
                </p>

                {!user ? (
                    <div className="flex justify-center gap-6 pt-8">
                        <Link to="/login" className="bg-blue-900 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-800 shadow-lg transition-all">
                            Login to Portal
                        </Link>
                    </div>
                ) : (
                    <div className="pt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200 inline-block">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome back!</h3>
                        <p className="text-gray-600 mb-6">You are logged in as a <span className="font-bold text-blue-800 uppercase">{user.user_type.replace('_', ' ')}</span></p>
                        <Link
                            to={user.user_type === 'recruiter' ? '/recruiter' : '/seeker'}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-md transition-all"
                        >
                            Go to My Dashboard
                        </Link>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mt-24">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 text-2xl">📄</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Parsing</h3>
                    <p className="text-gray-600">Upload your PDF or Word resume and let our AI instantly extract your skills, education, and experience.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 text-2xl">🎯</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AI Matchmaking</h3>
                    <p className="text-gray-600">Our algorithm scores candidates from 0-100% against job requirements to find the perfect fit.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 text-2xl">⚖️</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Unbiased Hiring</h3>
                    <p className="text-gray-600">Eliminate human bias. Candidates are ranked purely on merit, skills, and relevant experience.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
