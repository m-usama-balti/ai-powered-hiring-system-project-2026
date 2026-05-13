import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';
import {
    LayoutDashboard, Sparkles, FileText, Search, Briefcase,
    UserCircle, MessageSquare, Bell, TrendingUp, Target,
    Clock, CheckCircle2, AlertCircle, ArrowRight, UploadCloud, 
    MapPin, Save, Lightbulb, Zap, LogOut, Menu, X, Link, Lock
} from 'lucide-react';

const SeekerDashboard = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // UI State
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Data State
    const [applications, setApplications] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [assistantData, setAssistantData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Resume State
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState({ text: '', type: '' });
    const [parsedProfile, setParsedProfile] = useState(user?.profile || null);
    const [applyingTo, setApplyingTo] = useState(null);

    // Profile State
    const [profileForm, setProfileForm] = useState({
        name: user?.profile?.name || user?.name || '',
        email: user?.profile?.email || user?.email || '',
        password: '', 
        linkedin: user?.profile?.linkedin || user?.profile?.links?.find(l => l.includes('linkedin')) || '',
        github: user?.profile?.github || user?.profile?.links?.find(l => l.includes('github')) || '',
        portfolio: user?.profile?.portfolio_links?.[0] || '',
        skills: user?.profile?.skills?.join(', ') || '',
        experience_years: user?.profile?.experience_years || 0,
        desired_location: user?.profile?.desired_location || '',
        job_type: user?.profile?.job_type || 'Full-time',
        salary_expectation: user?.profile?.salary_expectation || ''
    });
    const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            if (['overview', 'tracking'].includes(activeTab)) {
                const { data } = await API.get('/applications/me');
                setApplications(data);
            }
            if (['overview', 'recommendations'].includes(activeTab)) {
                const { data } = await API.get('/jobs/recommendations');
                setRecommendations(data);
            }
            if (activeTab === 'search') {
                const { data } = await API.get('/jobs');
                setAllJobs(data.filter((job) => job.status === 'active'));
            }
            if (activeTab === 'notifications') {
                const { data } = await API.get('/applications/notifications');
                setNotifications(data);
            }
            if (activeTab === 'assistant') {
                const { data } = await API.get('/applications/assistant');
                setAssistantData(data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Close mobile menu when tab changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [activeTab]);

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setUploadMsg({ text: 'Please select a file first.', type: 'error' });
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);
        setUploading(true);
        setUploadMsg({ text: '', type: '' });

        try {
            const { data } = await API.post('/resume/upload', formData);
            const responseProfile = data?.user_profile || {};
            const aiProfile = data?.ai_data?.user_profile || data?.ai_data?.extracted_data || {};
            const extractedSkills = Array.isArray(responseProfile.skills)
                ? responseProfile.skills
                : (Array.isArray(aiProfile.skills) ? aiProfile.skills : []);
            const extractedYears = Number.isFinite(Number(aiProfile.experience_years))
                ? Number(aiProfile.experience_years) : 0;
            
            const nextProfile = {
                ...responseProfile,
                skills: extractedSkills,
                experience: responseProfile.experience || (extractedYears > 0 ? `${extractedYears} years` : '')
            };

            setParsedProfile(nextProfile);
            setProfileForm((prev) => ({
                ...prev,
                skills: extractedSkills.length > 0 ? extractedSkills.join(', ') : prev.skills,
                experience_years: extractedYears || prev.experience_years
            }));

            if (extractedSkills.length > 0) {
                setUploadMsg({ text: `AI parsed successfully! Detected ${extractedSkills.length} key skills.`, type: 'success' });
            } else {
                setUploadMsg({ text: 'Parsed, but no clear skills found. Try a cleaner format.', type: 'error' });
            }
            setFile(null);
        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Error parsing resume.';
            setUploadMsg({ text: errorMessage, type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleApply = async (jobId) => {
        setApplyingTo(jobId);
        try {
            await API.post(`/applications/${jobId}`);
            alert('Application submitted! AI is calculating your final match.');
            setActiveTab('tracking');
        } catch (error) {
            alert(error.response?.data?.message || 'Application failed.');
        } finally {
            setApplyingTo(null);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMsg({ text: 'Saving securely...', type: 'info' });
        try {
            const payload = {
                ...profileForm,
                skills: profileForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
            };
            const { data } = await API.put('/auth/me', payload);

            setParsedProfile(data.profile);
            if (setUser) setUser((prev) => ({ ...prev, ...data }));

            const currentStorage = JSON.parse(localStorage.getItem('userInfo') || '{}');
            localStorage.setItem('userInfo', JSON.stringify({ ...currentStorage, ...data }));

            setProfileMsg({ text: 'Profile & preferences locked in!', type: 'success' });
        } catch {
            setProfileMsg({ text: 'Failed to update. Please try again.', type: 'error' });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        if (setUser) setUser(null);
        navigate('/login');
    };

    const sidebarItems = [
        { id: 'overview', label: 'Smart Overview', icon: LayoutDashboard },
        { id: 'recommendations', label: 'AI Matches', icon: Sparkles },
        { id: 'resume', label: 'Resume Engine', icon: FileText },
        { id: 'search', label: 'Job Universe', icon: Search },
        { id: 'tracking', label: 'My Applications', icon: Briefcase },
        { id: 'profile', label: 'Settings & Profile', icon: UserCircle },
        { id: 'assistant', label: 'AI Advisor', icon: MessageSquare },
        { id: 'notifications', label: 'Alerts', icon: Bell }
    ];

    const normalizeMatchReasons = (reasons) => {
        if (Array.isArray(reasons)) return reasons;
        if (typeof reasons === 'string') return reasons.split(/[,;\n]/).map(r => r.trim()).filter(Boolean);
        if (reasons && typeof reasons === 'object') return Object.entries(reasons).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}%`);
        return [];
    };

    // ==========================================
    // RENDER: SMART OVERVIEW
    // ==========================================
    const renderOverview = () => {
        const avgScore = applications.length > 0
            ? Math.round(applications.reduce((acc, curr) => acc + curr.ai_match_score, 0) / applications.length)
            : 0;
            
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Glassy Stat Card 1 */}
                    <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all duration-500 group">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-500">
                                <Target className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full">Global Avg</span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 relative z-10">AI Match Rate</p>
                        <h3 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 mb-4 relative z-10">{avgScore}%</h3>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative z-10">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 relative" style={{ width: `${avgScore}%` }}>
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Glassy Stat Card 2 */}
                    <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)] transition-all duration-500 group">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-4 rounded-2xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-500">
                                <Briefcase className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full">Active</span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 relative z-10">Total Applied</p>
                        <h3 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 relative z-10">{applications.length}</h3>
                    </div>

                    {/* Glassy Stat Card 3 */}
                    <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(245,158,11,0.1)] transition-all duration-500 group">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-2xl text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-500">
                                <Clock className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-bold text-amber-700 bg-amber-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full">Pending</span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 relative z-10">Awaiting Review</p>
                        <h3 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 relative z-10">{applications.filter((a) => a.status === 'pending').length}</h3>
                    </div>
                </div>
            </div>
        );
    };

    // ==========================================
    // RENDER: RECOMMENDATIONS
    // ==========================================
    const renderRecommendations = () => {
        const safeRecommendations = recommendations.filter(rec => rec && rec.job && rec.job._id);

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {safeRecommendations.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur-md p-16 text-center rounded-[2rem] shadow-sm border border-white">
                        <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl p-8 inline-block mb-6 shadow-inner">
                            <Sparkles className="h-14 w-14 text-slate-400 mx-auto animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">No Magic Yet</h3>
                        <p className="text-slate-500 font-medium text-lg">Upload your resume to awaken the AI matching engine.</p>
                    </div>
                ) : (
                    safeRecommendations.map((rec, idx) => {
                        const reasons = normalizeMatchReasons(rec.match_reasons).slice(0, 3);
                        const jobId = rec.job._id;

                        return (
                            <div key={jobId || idx} className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white hover:shadow-[0_8px_30px_rgb(99,102,241,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden group">
                                <div className="p-8 flex flex-col lg:flex-row gap-10">
                                    {/* Left Side: Job Info */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{rec.job?.job_title || 'Unknown Job'}</h3>
                                                <p className="text-indigo-500 font-bold text-lg flex items-center gap-2">
                                                    <Briefcase className="h-5 w-5" />
                                                    {rec.job?.recruiter_id?.company?.company_name || 'Hiring Company'}
                                                </p>
                                            </div>
                                            <div className={`px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${rec.ai_match_score >= 80 ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200' : rec.ai_match_score >= 50 ? 'bg-amber-100/80 text-amber-800 border border-amber-200' : 'bg-red-100/80 text-red-800 border border-red-200'}`}>
                                                {rec.ai_match_score || 0}% AI Match
                                            </div>
                                        </div>

                                        {/* Reasons Box */}
                                        <div className="bg-gradient-to-br from-indigo-50/50 to-transparent p-6 rounded-3xl border border-indigo-100/50 mb-8">
                                            <h4 className="text-xs font-black text-indigo-800 uppercase flex items-center gap-2 mb-4 tracking-widest">
                                                <Sparkles className="h-4 w-4" /> Why You Fit Perfectly
                                            </h4>
                                            <ul className="space-y-3">
                                                {reasons.length > 0 ? reasons.map((reason, rIdx) => (
                                                    <li key={rIdx} className="flex items-start gap-3 text-slate-700 font-medium">
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                        <span>{reason}</span>
                                                    </li>
                                                )) : (
                                                    <li className="flex items-start gap-3 text-slate-500 font-medium">
                                                        <CheckCircle2 className="h-5 w-5 text-slate-300 mt-0.5 flex-shrink-0" />
                                                        <span>AI analysis pending...</span>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>

                                        {/* Meta Tags */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                                            <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-slate-400" /> {rec.job?.location || 'Remote'}
                                            </span>
                                            <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-slate-400" /> {rec.job?.job_type || 'Full-time'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Side: Action Area */}
                                    <div className="lg:border-l border-slate-100 lg:pl-10 flex flex-col justify-center min-w-[280px]">
                                        <div className="mb-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <p className="text-xs font-black text-slate-400 uppercase mb-3 tracking-widest text-center">Success Probability</p>
                                            <div className={`text-3xl font-black text-center mb-4 ${rec.hiring_probability === 'High' ? 'text-emerald-500' : rec.hiring_probability === 'Medium' ? 'text-amber-500' : 'text-red-500'}`}>
                                                {rec.hiring_probability || 'Medium'}
                                            </div>
                                            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${rec.hiring_probability === 'High' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : rec.hiring_probability === 'Medium' ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
                                                    style={{ width: rec.hiring_probability === 'High' ? '95%' : rec.hiring_probability === 'Medium' ? '60%' : '25%' }}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleApply(jobId)}
                                            disabled={applyingTo === jobId}
                                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black py-4 px-6 rounded-2xl hover:from-indigo-500 hover:to-violet-500 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                                        >
                                            {applyingTo === jobId ? (
                                                <><div className="w-5 h-5 border-3 border-white border-r-transparent rounded-full animate-spin" /> Processing...</>
                                            ) : (
                                                <>Apply with One Click <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        );
    };

    // ==========================================
    // RENDER: RESUME ENGINE
    // ==========================================
    const renderResume = () => {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="lg:col-span-1 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-white h-fit">
                    <div className="bg-indigo-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                        <UploadCloud className="h-7 w-7 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Upload Resume</h2>
                    <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">PDF, DOCX, PNG, or JPG. Our neural engine will extract your skills automatically.</p>
                    
                    <form onSubmit={handleFileUpload} className="space-y-6">
                        <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-3xl p-10 text-center hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer relative group overflow-hidden">
                            <input type="file" accept=".pdf,.docx,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="bg-white shadow-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <FileText className="h-8 w-8 text-indigo-500" />
                            </div>
                            <p className="text-sm font-bold text-indigo-900 mb-1">{file ? file.name : 'Drag & Drop or Browse'}</p>
                            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Max 10 MB</p>
                        </div>

                        <button type="submit" disabled={uploading || !file} className={`w-full py-4 rounded-2xl font-black text-white transition-all duration-300 ${uploading || !file ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5'}`}>
                            {uploading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-3 border-white border-r-transparent rounded-full animate-spin" />
                                    Analyzing Structure...
                                </div>
                            ) : 'Ignite Parse Engine'}
                        </button>
                    </form>
                    
                    {uploadMsg.text && (
                        <div className={`mt-6 p-5 rounded-2xl text-sm font-bold flex items-start gap-3 ${uploadMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                            {uploadMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" /> : <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />}
                            <span>{uploadMsg.text}</span>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    {!parsedProfile ? (
                        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-16 text-center border border-white h-full flex flex-col items-center justify-center">
                            <div className="bg-slate-100 rounded-3xl p-8 mb-6 shadow-inner">
                                <UserCircle className="h-16 w-16 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3">Ghost Protocol</h3>
                            <p className="text-slate-500 font-medium text-lg max-w-sm">We need data to work with. Upload your resume to generate a dynamic profile.</p>
                        </div>
                    ) : (
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white p-8 md:p-12 h-full">
                            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4 mb-10">
                                <div className="bg-emerald-400 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                                    <Zap className="text-white h-6 w-6" />
                                </div>
                                Synthesized Profile
                            </h2>
                            <div className="space-y-10">
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Detected Core Competencies ({parsedProfile.skills?.length || 0})</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {parsedProfile.skills?.map((skill, idx) => (
                                            <span key={idx} className="bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors cursor-default">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="border-t border-slate-100 pt-10">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Extracted Narrative</h3>
                                    <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                                        <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap text-lg">{parsedProfile.experience || 'No experience narrative detected.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ==========================================
    // RENDER: PROFILE & SETTINGS
    // ==========================================
    const renderProfile = () => {
        return (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-10 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h2 className="text-3xl font-black text-white flex items-center gap-4 mb-3">
                                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                                    <UserCircle className="h-7 w-7 text-indigo-300" />
                                </div>
                                Command Center
                            </h2>
                            <p className="text-indigo-200 font-medium text-lg">
                                Manipulate your raw data, public keys, and targeting vectors.
                            </p>
                        </div>
                        {user?.profile?.resume_url && (
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl flex items-center gap-4">
                                <div className="bg-emerald-400/20 p-2.5 rounded-xl">
                                    <FileText className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Active Payload</p>
                                    <p className="text-sm font-bold text-white truncate max-w-[150px]">{user.profile.resume_url}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 md:p-12">
                        {profileMsg.text && (
                            <div className={`mb-10 p-5 rounded-2xl text-sm font-bold flex items-start gap-4 border ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : profileMsg.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-indigo-50 text-indigo-800 border-indigo-200'}`}>
                                {profileMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" /> : <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />}
                                <span className="text-base">{profileMsg.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleProfileUpdate} className="space-y-12">
                            
                            {/* SECTION: IDENTIFICATION */}
                            <div>
                                <h3 className="text-xl font-black text-slate-900 border-b-2 border-slate-100 pb-4 mb-8 flex items-center gap-3">
                                    <Lock className="h-6 w-6 text-indigo-500" /> Identification Keys
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Operator Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-900 transition-all text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Comm Channel (Email)</label>
                                        <input
                                            type="email"
                                            value={profileForm.email}
                                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-900 transition-all text-lg"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Security Override (Password) <span className="text-slate-400 font-medium normal-case tracking-normal ml-2">Leave blank to maintain current clearance</span></label>
                                        <input
                                            type="password"
                                            value={profileForm.password}
                                            onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                                            placeholder="••••••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-900 transition-all text-lg placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: EXTERNAL NODES */}
                            <div>
                                <h3 className="text-xl font-black text-slate-900 border-b-2 border-slate-100 pb-4 mb-8 flex items-center gap-3">
                                    <Link className="h-6 w-6 text-indigo-500" /> External Nodes
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">LinkedIn Vector</label>
                                        <input
                                            type="url"
                                            value={profileForm.linkedin}
                                            onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                                            placeholder="https://linkedin.com/in/..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-900 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">GitHub Vector</label>
                                        <input
                                            type="url"
                                            value={profileForm.github}
                                            onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                                            placeholder="https://github.com/..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-900 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Primary Domain (Portfolio)</label>
                                        <input
                                            type="url"
                                            value={profileForm.portfolio}
                                            onChange={(e) => setProfileForm({ ...profileForm, portfolio: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-900 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: TARGETING PARAMETERS */}
                            <div>
                                <h3 className="text-xl font-black text-slate-900 border-b-2 border-slate-100 pb-4 mb-8 flex items-center gap-3">
                                    <Target className="h-6 w-6 text-indigo-500" /> Targeting Parameters
                                </h3>
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Core Algorithm Weights (Skills)</label>
                                        <textarea
                                            rows="3"
                                            value={profileForm.skills}
                                            onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none font-bold text-slate-900 transition-all placeholder:text-slate-300 text-lg leading-relaxed"
                                            placeholder="React, Management, Python, Design..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Operational Cycles (Years)</label>
                                            <input
                                                type="number" min="0" max="70"
                                                value={profileForm.experience_years}
                                                onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-black text-slate-900 transition-all text-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Deployment Type</label>
                                            <select
                                                value={profileForm.job_type}
                                                onChange={(e) => setProfileForm({ ...profileForm, job_type: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-900 transition-all text-lg cursor-pointer"
                                            >
                                                <option value="Full-time">Full-time</option>
                                                <option value="Part-time">Part-time</option>
                                                <option value="Contract">Contract</option>
                                                <option value="Remote">Remote Only</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Target Geo-Zone</label>
                                            <input
                                                type="text"
                                                value={profileForm.desired_location}
                                                onChange={(e) => setProfileForm({ ...profileForm, desired_location: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-900 transition-all text-lg"
                                                placeholder="e.g. Islamabad or Remote"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Resource Req (Monthly)</label>
                                            <input
                                                type="text"
                                                value={profileForm.salary_expectation}
                                                onChange={(e) => setProfileForm({ ...profileForm, salary_expectation: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-900 transition-all text-lg"
                                                placeholder="e.g. PKR 250,000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SUBMIT */}
                            <div className="pt-8">
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-slate-900 to-indigo-950 text-white py-5 rounded-2xl font-black hover:-translate-y-1 shadow-[0_10px_40px_rgba(30,27,75,0.3)] transition-all duration-300 text-xl flex items-center justify-center gap-3"
                                >
                                    <Save className="h-6 w-6 text-indigo-400" />
                                    Commit Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    // ==========================================
    // RENDER: OTHER TABS (Simplified for length)
    // ==========================================
    const renderAssistant = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-12 shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 relative z-10">
                    <div className="flex-1">
                        <h2 className="text-4xl font-black mb-4 flex items-center gap-4">
                            <div className="bg-amber-400 p-3 rounded-2xl text-slate-900 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                                <Lightbulb className="h-8 w-8" />
                            </div>
                            AI Career Advisor
                        </h2>
                        <p className="text-indigo-200 text-xl font-medium max-w-xl leading-relaxed">Neural analysis of your trajectory and strategic recommendations.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-[2rem] text-center min-w-[200px]">
                        <p className="text-xs uppercase font-black text-indigo-300 mb-3 tracking-widest">Employability Index</p>
                        <div className="flex items-baseline justify-center gap-1 mb-4">
                            <span className="text-6xl font-black">{assistantData?.employability_score || 0}</span>
                            <span className="text-2xl text-indigo-400 font-bold mb-1.5">/100</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]" style={{ width: `${(assistantData?.employability_score || 0)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Insights Map */}
            <div className="grid grid-cols-1 gap-6">
                {assistantData?.advice?.map((tip, idx) => (
                    <div key={idx} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-sm flex gap-6 hover:shadow-md transition-shadow">
                        <div className="bg-indigo-50 p-4 rounded-2xl h-fit">
                            <Zap className="h-6 w-6 text-indigo-600" />
                        </div>
                        <p className="text-slate-700 text-lg font-medium leading-relaxed pt-2">{tip}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTracking = () => (
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white overflow-hidden animate-in fade-in duration-700">
            {applications.length === 0 ? (
                <div className="p-20 text-center">
                    <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-slate-900">Zero Active Traces</h3>
                    <p className="text-slate-500 font-medium mt-3 text-lg">Deploy applications to monitor their status here.</p>
                </div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Target Vector</th>
                            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">AI Sync</th>
                            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {applications.map((app) => (
                            <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <p className="text-lg font-bold text-slate-900">{app.job_id?.job_title || 'Unknown'}</p>
                                    <p className="text-sm font-semibold text-slate-500 mt-1">{app.job_id?.recruiter_id?.company?.company_name || 'Company'}</p>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className="bg-indigo-50 text-indigo-700 font-black px-4 py-2 rounded-xl text-sm border border-indigo-100">
                                        {app.ai_match_score}%
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 ${app.status === 'shortlisted' ? 'bg-indigo-100 text-indigo-700' : app.status === 'interviewing' ? 'bg-emerald-100 text-emerald-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                        <div className={`w-2 h-2 rounded-full ${app.status === 'shortlisted' ? 'bg-indigo-500' : app.status === 'interviewing' ? 'bg-emerald-500' : app.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                        {app.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    const renderSearch = () => <div className="text-center p-20"><h2 className="text-3xl font-black text-slate-300">Job Universe Component</h2></div>;
    const renderNotifications = () => <div className="text-center p-20"><h2 className="text-3xl font-black text-slate-300">Alerts Component</h2></div>;

    // ==========================================
    // MAIN LAYOUT RETURN
    // ==========================================
    return (
        <div className="h-screen w-full bg-[#f8fafc] flex flex-col md:flex-row overflow-hidden font-sans selection:bg-indigo-200">
            
            {/* Mobile Header */}
            <div className="md:hidden bg-white/80 backdrop-blur-xl border-b border-slate-200 p-4 flex justify-between items-center z-50 relative">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Career<span className="text-indigo-600">OS</span></h2>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-100 rounded-xl text-slate-600">
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Sidebar (Glassmorphism + Responsive) */}
            <aside className={`absolute md:relative top-[73px] md:top-0 left-0 h-[calc(100vh-73px)] md:h-screen w-full md:w-80 bg-white/90 backdrop-blur-2xl border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col shrink-0 z-40 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                
                <div className="hidden md:block p-8 border-b border-slate-100/50">
                    <div className="bg-gradient-to-r from-slate-900 to-indigo-900 inline-block text-transparent bg-clip-text">
                        <h2 className="text-3xl font-black tracking-tighter">Career<span className="text-indigo-500">OS</span></h2>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">v3.0 Neural Build</p>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 no-scrollbar">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm outline-none ${isActive
                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-x-2'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-100/50 bg-slate-50/50 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 font-black text-sm text-red-500 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-100"
                    >
                        <LogOut className="h-5 w-5" /> Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-[calc(100vh-73px)] md:h-screen w-full overflow-y-auto p-6 md:p-12 relative">
                {/* Background ambient glow */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10"></div>
                
                <div className="max-w-7xl mx-auto pb-20">
                    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                            {sidebarItems.find((item) => item.id === activeTab)?.label}
                        </h1>
                    </div>

                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-[50vh] gap-4">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-indigo-600 font-bold tracking-widest uppercase text-sm animate-pulse">Syncing Database...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'recommendations' && renderRecommendations()}
                            {activeTab === 'resume' && renderResume()}
                            {activeTab === 'search' && renderSearch()}
                            {activeTab === 'tracking' && renderTracking()}
                            {activeTab === 'profile' && renderProfile()}
                            {activeTab === 'assistant' && renderAssistant()}
                            {activeTab === 'notifications' && renderNotifications()}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SeekerDashboard;