import { useState, useEffect, useContext } from 'react';
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

    useEffect(() => {
        fetchDashboardData();
    }, [activeTab]);

    const fetchDashboardData = async () => {
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
    };

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
        } catch (error) {
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
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-indigo-500">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600"><Target className="h-5 w-5" /></div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Avg Match Score</p>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">{avgScore}%</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600"><Briefcase className="h-5 w-5" /></div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Jobs Applied</p>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">{applications.length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="bg-amber-100 p-3 rounded-lg text-amber-600"><Clock className="h-5 w-5" /></div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Pending Review</p>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">{applications.filter((a) => a.status === 'pending').length}</h3>
                    </div>
                </div>
            </div>
        );
    };

    const renderRecommendations = () => {
        return (
            <div className="space-y-6 animate-fade-in">
                {recommendations.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-slate-200">
                        <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No Recommendations Yet</h3>
                        <p className="text-slate-500">Upload your resume to get AI matches.</p>
                    </div>
                ) : (
                    recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                            <div className="grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-2xl font-bold text-slate-900">{rec.job?.job_title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${rec.ai_match_score >= 80 ? 'bg-emerald-100 text-emerald-800' : rec.ai_match_score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                        {rec.ai_match_score}% Match
                                    </span>
                                </div>
                                <p className="text-indigo-600 font-semibold mb-4">{rec.job?.recruiter_id?.company?.company_name || 'Hiring Company'}</p>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2"><Sparkles className="h-3 w-3" /> AI Insights</h4>
                                    <ul className="text-sm text-slate-700 space-y-1">
                                        {rec.match_reasons?.map((reason, rIdx) => <li key={rIdx} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {reason}</li>)}
                                    </ul>
                                </div>
                            </div>
                            <div className="min-w-45 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-6">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Probability</p>
                                    <p className={`text-lg font-black ${rec.hiring_probability === 'High' ? 'text-emerald-600' : rec.hiring_probability === 'Medium' ? 'text-amber-600' : 'text-red-600'}`}>{rec.hiring_probability}</p>
                                </div>
                                <button onClick={() => handleApply(rec.job._id)} disabled={applyingTo === rec.job._id} className="mt-4 w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400">
                                    {applyingTo === rec.job._id ? 'Applying...' : 'Apply Now'} <ArrowRight className="h-4 w-4" />
                                </button>
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
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Upload Resume</h2>
                    <p className="text-sm text-slate-500 mb-6">PDF or DOCX. Our AI will automatically extract your technical skills.</p>
                    <form onSubmit={handleFileUpload} className="space-y-4">
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 hover:border-indigo-400 transition-colors cursor-pointer relative">
                            <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <UploadCloud className="h-10 w-10 text-indigo-500 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-700">{file ? file.name : 'Click or drag file here'}</p>
                        </div>
                        <button type="submit" disabled={uploading || !file} className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-sm ${uploading || !file ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            {uploading ? 'AI is Parsing...' : 'Parse Resume'}
                        </button>
                    </form>
                    {uploadMsg.text && (
                        <div className={`mt-4 p-3 rounded-lg text-sm font-bold ${uploadMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {uploadMsg.text}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    {!parsedProfile ? (
                        <div className="bg-slate-100 rounded-2xl p-12 text-center border border-slate-200">
                            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No Profile Data Found</h3>
                            <p className="text-slate-500">Upload your resume to generate your AI-analyzed profile.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-6"><CheckCircle2 className="text-emerald-500 h-6 w-6" /> AI Extracted Profile</h2>
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Detected Technical Skills ({parsedProfile.skills?.length || 0})</h3>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {parsedProfile.skills?.map((skill, idx) => (
                                        <span key={idx} className="bg-indigo-50 text-indigo-800 border border-indigo-100 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">{skill}</span>
                                    ))}
                                </div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Extracted Experience</h3>
                                <p className="text-slate-700 font-medium whitespace-pre-wrap">{parsedProfile.experience || 'No experience block detected.'}</p>
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
            <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center">
                    <Search className="h-5 w-5 text-slate-400 ml-2 mr-4" />
                    <input
                        type="text"
                        placeholder="Search jobs by title, skill, or keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-slate-800 outline-none placeholder:text-slate-400"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.length === 0 ? (
                        <div className="md:col-span-2 text-center py-12 text-slate-500">No active jobs match your search.</div>
                    ) : (
                        filteredJobs.map((job) => (
                            <div key={job._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">{job.job_title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium mb-4">
                                        <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.recruiter_id?.company?.company_name || 'Company'}</span>
                                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location || 'Remote'}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {job.requirements?.skills?.slice(0, 4).map((s, i) => <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-bold">{s}</span>)}
                                    </div>
                                </div>
                                <button onClick={() => handleApply(job._id)} disabled={applyingTo === job._id} className="w-full bg-indigo-50 text-indigo-700 font-bold py-2.5 rounded-lg hover:bg-indigo-100 transition-colors disabled:bg-slate-100 disabled:text-slate-400">
                                    {applyingTo === job._id ? 'Applying...' : 'Apply (AI Scoring)'}
                                </button>
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
                    <div className="p-12 text-center">
                        <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No Applications Yet</h3>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold">Role &amp; Company</th>
                                <th className="p-4 font-bold text-center">Match Score</th>
                                <th className="p-4 font-bold text-right">Current Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {applications.map((app) => (
                                <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-slate-900">{app.job_id?.job_title || 'Unknown Job'}</p>
                                        <p className="text-sm text-slate-500">{app.job_id?.recruiter_id?.company?.company_name || 'Hiring Company'}</p>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm">{app.ai_match_score}%</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${app.status === 'shortlisted' ? 'bg-indigo-100 text-indigo-700' : app.status === 'interviewing' ? 'bg-emerald-100 text-emerald-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
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
    };

    const renderProfile = () => {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in max-w-3xl">
                <div className="border-b border-slate-200 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Profile &amp; Preferences</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Manually override AI-extracted data or set your preferences to improve your job recommendations.
                    </p>
                </div>

                {profileMsg.text && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : profileMsg.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                        {profileMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        {profileMsg.text}
                    </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Technical Skills (Comma separated)</label>
                            <textarea rows="3" value={profileForm.skills} onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-600 outline-none transition-all resize-none" placeholder="React, Python, Node.js..." />
                            <p className="text-xs text-slate-400 mt-1">These are used heavily by the matchmaking algorithm.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Years of Experience</label>
                            <input type="number" min="0" value={profileForm.experience_years} onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Job Type Preference</label>
                            <select value={profileForm.job_type} onChange={(e) => setProfileForm({ ...profileForm, job_type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-600 outline-none transition-all cursor-pointer">
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Remote">Remote</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Desired Location</label>
                            <input type="text" value={profileForm.desired_location} onChange={(e) => setProfileForm({ ...profileForm, desired_location: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" placeholder="e.g. Islamabad or Remote" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Salary Expectation (Monthly)</label>
                            <input type="text" value={profileForm.salary_expectation} onChange={(e) => setProfileForm({ ...profileForm, salary_expectation: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" placeholder="e.g. PKR 150,000" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                        <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all text-lg flex items-center justify-center gap-2">
                            <Save className="h-5 w-5" /> Save Profile Preferences
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const renderAssistant = () => {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-indigo-900 rounded-2xl p-8 shadow-sm text-white flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Lightbulb className="h-6 w-6 text-yellow-400" /> AI Career Advisor</h2>
                        <p className="text-indigo-200">Personalized insights based on your extracted profile data.</p>
                    </div>
                    <div className="text-center bg-indigo-800 p-4 rounded-xl border border-indigo-700 min-w-37.5">
                        <p className="text-xs uppercase font-bold text-indigo-300 mb-1">Employability Score</p>
                        <p className="text-3xl font-black text-white">{assistantData?.employability_score || 0}/100</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Zap className="text-indigo-600 h-5 w-5" /> Actionable Insights</h3>
                    <div className="space-y-4">
                        {assistantData?.advice?.map((tip, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex gap-4 items-start">
                                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm"><Sparkles className="h-5 w-5 text-indigo-600" /></div>
                                <p className="text-slate-700 leading-relaxed pt-1">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderNotifications = () => {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Bell className="text-indigo-600 h-6 w-6" /> Recent Alerts</h2>
                {notifications.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                        <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">You have no new notifications.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notif) => (
                            <div key={notif.id} className={`p-5 rounded-xl border-l-4 shadow-sm flex items-start gap-4 ${notif.type === 'success' ? 'border-l-emerald-500 bg-emerald-50' : notif.type === 'info' ? 'border-l-blue-500 bg-blue-50' : 'border-l-red-500 bg-red-50'}`}>
                                <div>
                                    {notif.type === 'success' && <CheckCircle2 className="h-6 w-6 text-emerald-600" />}
                                    {notif.type === 'info' && <AlertCircle className="h-6 w-6 text-blue-600" />}
                                    {notif.type === 'error' && <AlertCircle className="h-6 w-6 text-red-600" />}
                                </div>
                                <div>
                                    <h4 className={`font-bold ${notif.type === 'success' ? 'text-emerald-900' : notif.type === 'info' ? 'text-blue-900' : 'text-red-900'}`}>{notif.title}</h4>
                                    <p className="text-slate-700 text-sm mt-1">{notif.message}</p>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">{new Date(notif.date).toLocaleString()}</p>
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
