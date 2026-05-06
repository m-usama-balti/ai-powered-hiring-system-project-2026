import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';
import {
    LayoutDashboard, Sparkles, FileText, Search, Briefcase,
    UserCircle, MessageSquare, Bell, TrendingUp, Target,
    Clock, CheckCircle2, AlertCircle, ArrowRight, UploadCloud, MapPin, Save, Lightbulb, Zap, LogOut
} from 'lucide-react';

const SeekerDashboard = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const [applications, setApplications] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [assistantData, setAssistantData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState({ text: '', type: '' });
    const [parsedProfile, setParsedProfile] = useState(user?.profile || null);
    const [applyingTo, setApplyingTo] = useState(null);

    const [profileForm, setProfileForm] = useState({
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
            const { data } = await API.post('/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const responseProfile = data?.user_profile || {};
            const aiProfile = data?.ai_data?.user_profile || data?.ai_data?.extracted_data || {};
            const extractedSkills = Array.isArray(responseProfile.skills)
                ? responseProfile.skills
                : (Array.isArray(aiProfile.skills) ? aiProfile.skills : []);
            const extractedYears = Number.isFinite(Number(aiProfile.experience_years))
                ? Number(aiProfile.experience_years)
                : 0;
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
                setUploadMsg({ text: `Resume parsed successfully via NLP! Detected ${extractedSkills.length} skills.`, type: 'success' });
            } else {
                setUploadMsg({ text: 'Resume parsed, but no skills were detected. Try a clearer PDF or update your resume text formatting.', type: 'error' });
            }

            setFile(null);
        } catch (error) {
            setUploadMsg({ text: error.response?.data?.message || 'Error parsing resume.', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleApply = async (jobId) => {
        setApplyingTo(jobId);
        try {
            await API.post(`/applications/${jobId}`);
            alert('Application submitted successfully! Our AI is calculating your match score.');
            setActiveTab('tracking');
        } catch (error) {
            alert(error.response?.data?.message || 'Application failed.');
        } finally {
            setApplyingTo(null);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMsg({ text: 'Saving...', type: 'info' });
        try {
            const payload = {
                ...profileForm,
                skills: profileForm.skills
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s)
            };
            const { data } = await API.put('/auth/me', payload);

            setParsedProfile(data.profile);
            if (setUser) {
                setUser((prev) => ({ ...prev, ...data }));
            }

            const currentStorage = JSON.parse(localStorage.getItem('userInfo') || '{}');
            localStorage.setItem('userInfo', JSON.stringify({ ...currentStorage, ...data }));

            setProfileMsg({ text: 'Profile updated successfully! AI algorithms adjusted.', type: 'success' });
        } catch {
            setProfileMsg({ text: 'Failed to update profile.', type: 'error' });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        if (setUser) setUser(null);
        navigate('/login');
    };

    const sidebarItems = [
        { id: 'overview', label: 'Smart Overview', icon: LayoutDashboard },
        { id: 'recommendations', label: 'AI Recommendations', icon: Sparkles },
        { id: 'resume', label: 'Resume Intelligence', icon: FileText },
        { id: 'search', label: 'AI Job Search', icon: Search },
        { id: 'tracking', label: 'Application Tracking', icon: Briefcase },
        { id: 'profile', label: 'Profile Management', icon: UserCircle },
        { id: 'assistant', label: 'AI Career Assistant', icon: MessageSquare },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    const renderOverview = () => {
        const avgScore = applications.length > 0
            ? Math.round(applications.reduce((acc, curr) => acc + curr.ai_match_score, 0) / applications.length)
            : 0;
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Avg Match Score Card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl shadow-sm border border-indigo-100 hover:shadow-md transition-all duration-300 hover:border-indigo-200 group">
                        <div className="flex items-start justify-between mb-6">
                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-xl text-white shadow-md group-hover:shadow-lg transition-all">
                                <Target className="h-6 w-6" />
                            </div>
                            <div className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-lg">Live</div>
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Average Match</p>
                        <h3 className="text-4xl font-black text-slate-900 mb-2">{avgScore}%</h3>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600" style={{ width: `${avgScore}%` }}></div>
                        </div>
                    </div>

                    {/* Jobs Applied Card */}
                    <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition-all duration-300 hover:border-emerald-200 group">
                        <div className="flex items-start justify-between mb-6">
                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-xl text-white shadow-md group-hover:shadow-lg transition-all">
                                <Briefcase className="h-6 w-6" />
                            </div>
                            <div className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">+12% this month</div>
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Applications</p>
                        <h3 className="text-4xl font-black text-slate-900">{applications.length}</h3>
                    </div>

                    {/* Pending Review Card */}
                    <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-2xl shadow-sm border border-amber-100 hover:shadow-md transition-all duration-300 hover:border-amber-200 group">
                        <div className="flex items-start justify-between mb-6">
                            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-xl text-white shadow-md group-hover:shadow-lg transition-all">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div className="text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-lg">Awaiting</div>
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Pending Review</p>
                        <h3 className="text-4xl font-black text-slate-900">{applications.filter((a) => a.status === 'pending').length}</h3>
                    </div>
                </div>
            </div>
        );
    };

    const renderRecommendations = () => {
        return (
            <div className="space-y-6 animate-fade-in">
                {recommendations.length === 0 ? (
                    <div className="bg-white p-16 text-center rounded-2xl shadow-sm border border-slate-200 hover:shadow-sm transition-shadow">
                        <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-8 inline-block mb-4">
                            <Sparkles className="h-14 w-14 text-slate-300 mx-auto" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Recommendations Yet</h3>
                        <p className="text-slate-500 font-medium">Upload your resume to get AI-matched opportunities.</p>
                    </div>
                ) : (
                    recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 overflow-hidden group">
                            <div className="p-8 md:p-8 flex flex-col md:flex-row gap-8">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4 gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{rec.job?.job_title}</h3>
                                            <p className="text-indigo-600 font-semibold text-base">{rec.job?.recruiter_id?.company?.company_name || 'Hiring Company'}</p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider whitespace-nowrap ${rec.ai_match_score >= 80 ? 'bg-emerald-100 text-emerald-800' : rec.ai_match_score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                            {rec.ai_match_score}% Match
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-indigo-50 to-transparent p-5 rounded-xl border border-indigo-100 mb-6">
                                        <h4 className="text-xs font-bold text-indigo-700 uppercase flex items-center gap-2 mb-3 tracking-wider"><Sparkles className="h-4 w-4" /> Why You're a Great Fit</h4>
                                        <ul className="space-y-2">
                                            {rec.match_reasons?.slice(0, 3).map((reason, rIdx) => (
                                                <li key={rIdx} className="flex items-start gap-3 text-sm text-slate-700">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                    <span className="font-medium">{reason}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm">
                                        <span className="text-slate-600 flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            {rec.job?.location || 'Remote'}
                                        </span>
                                        <span className="text-slate-600 flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-slate-400" />
                                            {rec.job?.job_type || 'Full-time'}
                                        </span>
                                    </div>
                                </div>

                                <div className="md:border-l border-slate-200 md:pl-8 pt-6 md:pt-0 flex flex-col justify-between">
                                    <div className="mb-6">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Hiring Probability</p>
                                        <div className={`text-2xl font-black ${rec.hiring_probability === 'High' ? 'text-emerald-600' : rec.hiring_probability === 'Medium' ? 'text-amber-600' : 'text-red-600'}`}>
                                            {rec.hiring_probability}
                                        </div>
                                        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${rec.hiring_probability === 'High' ? 'bg-emerald-500' : rec.hiring_probability === 'Medium' ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: rec.hiring_probability === 'High' ? '100%' : rec.hiring_probability === 'Medium' ? '65%' : '30%' }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleApply(rec.job._id)}
                                        disabled={applyingTo === rec.job._id}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-3.5 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {applyingTo === rec.job._id ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
                                                Applying...
                                            </>
                                        ) : (
                                            <>
                                                <ArrowRight className="h-4 w-4" />
                                                Apply Now
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    };

    const renderResume = () => {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-fit">
                    <h2 className="text-xl font-bold text-slate-900 mb-1">Upload Resume</h2>
                    <p className="text-sm text-slate-500 mb-8">PDF or DOCX. Our AI automatically extracts your skills.</p>
                    <form onSubmit={handleFileUpload} className="space-y-4">
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer relative group">
                            <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <div className="bg-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200 transition-colors">
                                <UploadCloud className="h-6 w-6 text-indigo-600" />
                            </div>
                            <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">{file ? file.name : 'Click or drag file'}</p>
                            <p className="text-xs text-slate-400 mt-1">Max 10 MB</p>
                        </div>
                        <button type="submit" disabled={uploading || !file} className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-sm ${uploading || !file ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg'}`}>
                            {uploading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
                                    Parsing Resume...
                                </div>
                            ) : (
                                'Parse Resume'
                            )}
                        </button>
                    </form>
                    {uploadMsg.text && (
                        <div className={`mt-4 p-4 rounded-xl text-sm font-bold flex items-start gap-3 ${uploadMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            {uploadMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                            <span>{uploadMsg.text}</span>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    {!parsedProfile ? (
                        <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-16 text-center border border-slate-200">
                            <div className="bg-white rounded-2xl p-6 inline-block mb-4">
                                <FileText className="h-12 w-12 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Profile Data Found</h3>
                            <p className="text-slate-600 font-medium">Upload your resume to generate your AI-analyzed profile.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-8">
                                <div className="bg-emerald-100 p-2 rounded-lg">
                                    <CheckCircle2 className="text-emerald-600 h-6 w-6" />
                                </div>
                                AI-Extracted Profile
                            </h2>
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">Detected Technical Skills ({parsedProfile.skills?.length || 0})</h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {parsedProfile.skills?.map((skill, idx) => (
                                            <span key={idx} className="bg-gradient-to-br from-indigo-50 to-indigo-25 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="border-t border-slate-200 pt-8">
                                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Extracted Experience</h3>
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{parsedProfile.experience || 'No experience block detected.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderSearch = () => {
        const filteredJobs = allJobs.filter((job) =>
            job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="space-y-8 animate-fade-in">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-sm transition-shadow overflow-hidden">
                    <div className="flex items-center px-6 py-4 border-b border-slate-200">
                        <Search className="h-5 w-5 text-slate-400 ml-1 mr-4" />
                        <input
                            type="text"
                            placeholder="Search by job title, company, skills, or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 outline-none placeholder:text-slate-400 py-2"
                        />
                    </div>
                    {searchQuery && (
                        <div className="px-6 py-3 bg-slate-50 text-sm text-slate-600 font-medium border-t border-slate-200">
                            {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''} found
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.length === 0 ? (
                        <div className="md:col-span-2">
                            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
                                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-600 font-medium text-lg">No jobs match your search.</p>
                                <p className="text-slate-500 text-sm mt-1">Try adjusting your keywords or filters.</p>
                            </div>
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <div key={job._id} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 overflow-hidden group flex flex-col">
                                <div className="p-6 md:p-7 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">{job.job_title}</h3>
                                        <div className="flex flex-col gap-2 text-sm text-slate-600 font-medium">
                                            <span className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-slate-400" />
                                                {job.recruiter_id?.company?.company_name || 'Company'}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-slate-400" />
                                                {job.location || 'Remote'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 flex-1">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Required Skills</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {job.requirements?.skills?.slice(0, 5).map((s, i) => (
                                                <span key={i} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-semibold hover:bg-slate-200 transition-colors">
                                                    {s}
                                                </span>
                                            ))}
                                            {job.requirements?.skills?.length > 5 && (
                                                <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg font-bold">
                                                    +{job.requirements.skills.length - 5}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 md:p-7 border-t border-slate-200 bg-slate-50">
                                    <button
                                        onClick={() => handleApply(job._id)}
                                        disabled={applyingTo === job._id}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {applyingTo === job._id ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
                                                Applying...
                                            </div>
                                        ) : (
                                            'Apply Now'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const renderTracking = () => {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                {applications.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="bg-slate-100 rounded-2xl p-6 inline-block mb-4">
                            <Briefcase className="h-12 w-12 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No Applications Yet</h3>
                        <p className="text-slate-500 font-medium mt-2">Start applying to jobs to track your progress here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Position &amp; Company</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">AI Match</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Applied</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {applications.map((app) => (
                                    <tr key={app._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{app.job_id?.job_title || 'Unknown Job'}</p>
                                                <p className="text-sm text-slate-500 mt-1">{app.job_id?.recruiter_id?.company?.company_name || 'Hiring Company'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-indigo-25 px-3 py-1.5 rounded-full">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                <span className="font-black text-indigo-700 text-sm">{app.ai_match_score}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="inline-block">
                                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${app.status === 'shortlisted'
                                                    ? 'bg-indigo-100 text-indigo-700'
                                                    : app.status === 'interviewing'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : app.status === 'rejected'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    <div className={`w-2 h-2 rounded-full ${app.status === 'shortlisted'
                                                        ? 'bg-indigo-500'
                                                        : app.status === 'interviewing'
                                                            ? 'bg-emerald-500'
                                                            : app.status === 'rejected'
                                                                ? 'bg-red-500'
                                                                : 'bg-amber-500'
                                                        }`}></div>
                                                    {app.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right text-sm text-slate-500 font-medium">
                                            {new Date(app.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const renderProfile = () => {
        return (
            <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-indigo-50 px-8 py-8 border-b border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-2">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <UserCircle className="h-6 w-6 text-indigo-600" />
                            </div>
                            Profile &amp; Preferences
                        </h2>
                        <p className="text-slate-600 font-medium">
                            Customize your job preferences and override AI-extracted data to improve recommendations.
                        </p>
                    </div>

                    <div className="p-8 md:p-10">
                        {profileMsg.text && (
                            <div className={`mb-8 p-4 rounded-xl text-sm font-semibold flex items-start gap-3 border ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : profileMsg.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-indigo-50 text-indigo-800 border-indigo-200'}`}>
                                {profileMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                                <span>{profileMsg.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleProfileUpdate} className="space-y-8">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-800 mb-3">Technical Skills (Comma separated)</label>
                                <textarea
                                    rows="4"
                                    value={profileForm.skills}
                                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none font-medium text-slate-800 placeholder:text-slate-400"
                                    placeholder="React, Python, Node.js, Machine Learning, Data Analysis..."
                                />
                                <p className="text-xs text-slate-500 font-medium mt-2">These skills are heavily weighted in the AI matching algorithm.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 pt-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-3">Years of Experience</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="70"
                                            value={profileForm.experience_years}
                                            onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-semibold text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-3">Job Type Preference</label>
                                    <select
                                        value={profileForm.job_type}
                                        onChange={(e) => setProfileForm({ ...profileForm, job_type: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer font-semibold text-slate-800"
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Remote">Remote</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-3">Desired Location</label>
                                    <input
                                        type="text"
                                        value={profileForm.desired_location}
                                        onChange={(e) => setProfileForm({ ...profileForm, desired_location: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                        placeholder="e.g. Islamabad, Karachi, or Remote"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-3">Salary Expectation (Monthly)</label>
                                    <input
                                        type="text"
                                        value={profileForm.salary_expectation}
                                        onChange={(e) => setProfileForm({ ...profileForm, salary_expectation: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                        placeholder="e.g. PKR 150,000 - 300,000"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-8">
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all text-lg flex items-center justify-center gap-2"
                                >
                                    <Save className="h-5 w-5" />
                                    Save Profile Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    const renderAssistant = () => {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 rounded-2xl p-10 shadow-md text-white">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
                                <div className="bg-yellow-400 p-2 rounded-lg">
                                    <Lightbulb className="h-6 w-6 text-indigo-900" />
                                </div>
                                AI Career Advisor
                            </h2>
                            <p className="text-indigo-200 text-lg font-medium">Personalized insights and recommendations based on your extracted profile.</p>
                        </div>
                        <div className="bg-indigo-800 border border-indigo-700 backdrop-blur-sm p-6 rounded-2xl min-w-max">
                            <p className="text-xs uppercase font-bold text-indigo-300 mb-2 tracking-wider">Employability Score</p>
                            <div className="flex items-end gap-1">
                                <p className="text-5xl font-black text-white">{assistantData?.employability_score || 0}</p>
                                <p className="text-2xl text-indigo-300 font-bold mb-1">/100</p>
                            </div>
                            <div className="mt-3 h-1.5 bg-indigo-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500" style={{ width: `${(assistantData?.employability_score || 0)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
                    <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Zap className="text-indigo-600 h-6 w-6" />
                        </div>
                        Actionable Insights
                    </h3>
                    <div className="space-y-4">
                        {assistantData?.advice && assistantData.advice.length > 0 ? (
                            assistantData.advice.map((tip, idx) => (
                                <div key={idx} className="p-6 bg-gradient-to-br from-slate-50 to-slate-25 border border-slate-100 rounded-2xl hover:shadow-md transition-all group">
                                    <div className="flex gap-4 items-start">
                                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm group-hover:shadow-md transition-all flex-shrink-0">
                                            <Sparkles className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <p className="text-slate-700 leading-relaxed font-medium pt-1">{tip}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                                <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-600 font-medium">No advice available yet. Complete your profile to get personalized recommendations.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderNotifications = () => {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 animate-fade-in max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <Bell className="text-indigo-600 h-6 w-6" />
                    </div>
                    Recent Alerts &amp; Updates
                </h2>
                {notifications.length === 0 ? (
                    <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                        <div className="bg-white p-4 rounded-xl inline-block mb-4">
                            <Bell className="h-10 w-10 text-slate-300" />
                        </div>
                        <p className="text-slate-600 font-medium text-lg">No new notifications</p>
                        <p className="text-slate-500 text-sm mt-1">You're all caught up! Check back soon for updates.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-6 rounded-2xl border-l-4 shadow-sm hover:shadow-md transition-all group flex gap-4 ${notif.type === 'success'
                                    ? 'border-l-emerald-500 bg-emerald-50 hover:bg-emerald-100'
                                    : notif.type === 'info'
                                        ? 'border-l-indigo-500 bg-indigo-50 hover:bg-indigo-100'
                                        : notif.type === 'warning'
                                            ? 'border-l-amber-500 bg-amber-50 hover:bg-amber-100'
                                            : 'border-l-red-500 bg-red-50 hover:bg-red-100'
                                    }`}
                            >
                                <div className="flex-shrink-0 pt-1">
                                    {notif.type === 'success' && <CheckCircle2 className="h-6 w-6 text-emerald-600" />}
                                    {notif.type === 'info' && <AlertCircle className="h-6 w-6 text-indigo-600" />}
                                    {notif.type === 'warning' && <AlertCircle className="h-6 w-6 text-amber-600" />}
                                    {notif.type === 'error' && <AlertCircle className="h-6 w-6 text-red-600" />}
                                </div>
                                <div className="flex-1">
                                    <h4
                                        className={`font-bold text-lg ${notif.type === 'success'
                                            ? 'text-emerald-900'
                                            : notif.type === 'info'
                                                ? 'text-indigo-900'
                                                : notif.type === 'warning'
                                                    ? 'text-amber-900'
                                                    : 'text-red-900'
                                            }`}
                                    >
                                        {notif.title}
                                    </h4>
                                    <p className="text-slate-700 font-medium mt-1">{notif.message}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-3">
                                        {new Date(notif.date).toLocaleString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        // 1. OUTER WRAPPER: Locks to exact screen size, prevents body scroll
        <div className="h-screen w-full bg-slate-50 flex flex-col md:flex-row overflow-hidden">

            {/* 2. SIDEBAR: Full height of the screen, fixed width, doesn't shrink */}
            <aside className="w-full md:w-72 bg-white border-r border-slate-200 shadow-sm flex flex-col h-full shrink-0 z-40">

                {/* Sidebar Header */}
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Career Portal</h2>
                    <p className="text-sm font-medium text-indigo-600 mt-1">AI-driven Talent Profiling</p>
                </div>

                {/* Sidebar Links (auto-scrolls if too many links) */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Log Out Button (Pushed to absolute bottom) */}
                <div className="p-4 border-t border-slate-100 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                        <LogOut className="h-5 w-5" />
                        Secure Log Out
                    </button>
                </div>
            </aside>

            {/* 3. MAIN CONTENT: Fills remaining space, handles its own scrolling */}
            <main className="flex-1 h-full w-full overflow-y-auto p-6 md:p-10 bg-slate-50">
                <div className="max-w-6xl mx-auto pb-12">

                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900">
                            {sidebarItems.find((item) => item.id === activeTab)?.label}
                        </h1>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <TrendingUp className="h-8 w-8 text-indigo-600 animate-bounce" />
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
