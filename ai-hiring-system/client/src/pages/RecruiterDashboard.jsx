import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';
import {
    LayoutDashboard, Briefcase, Users, PieChart as PieChartIcon,
    Plus, Edit3, Trash2, MapPin, Clock, Building2, CheckCircle2,
    AlertCircle, TrendingUp, Star, Calendar, MessageSquare, XCircle, LogOut, BrainCircuit, X
} from 'lucide-react';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const RecruiterDashboard = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    const [myJobs, setMyJobs] = useState([]);
    const [showJobForm, setShowJobForm] = useState(false);
    const [editingJobId, setEditingJobId] = useState(null);
    const [jobForm, setJobForm] = useState({ job_title: '', description: '', skills: '', experience_years: 0, location: '' });
    const [formMsg, setFormMsg] = useState({ text: '', type: '' });

    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);

    const [analytics, setAnalytics] = useState(null);
    const [interviewGuide, setInterviewGuide] = useState(null);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [guideLoading, setGuideLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, [activeTab]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            if (['jobs', 'ats'].includes(activeTab)) {
                const { data } = await API.get('/jobs/me');
                setMyJobs(data);
                if (activeTab === 'ats' && data.length > 0 && !selectedJob) {
                    handleSelectJob(data[0]);
                }
            }
            if (['overview', 'analytics'].includes(activeTab)) {
                const { data } = await API.get('/jobs/analytics');
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateGuide = async (appId) => {
        setGuideLoading(true);
        setShowGuideModal(true);
        try {
            const { data } = await API.get(`/applications/${appId}/interview-guide`);
            setInterviewGuide(data);
        } catch (error) {
            alert("Failed to generate AI guide.");
            setShowGuideModal(false);
        } finally {
            setGuideLoading(false);
        }
    };

    const handleSaveJob = async (e) => {
        e.preventDefault();
        setFormMsg({ text: 'Saving...', type: 'info' });
        try {
            const payload = {
                job_title: jobForm.job_title,
                description: jobForm.description,
                location: jobForm.location || 'Remote',
                requirements: {
                    skills: jobForm.skills.split(',').map((s) => s.trim()),
                    experience_years: Number(jobForm.experience_years)
                }
            };
            if (editingJobId) {
                await API.put(`/jobs/${editingJobId}`, payload);
                setFormMsg({ text: 'Job updated successfully!', type: 'success' });
            } else {
                await API.post('/jobs', payload);
                setFormMsg({ text: 'Job created successfully!', type: 'success' });
            }
            fetchDashboardData();
            setTimeout(() => {
                setShowJobForm(false);
                setEditingJobId(null);
                setJobForm({ job_title: '', description: '', skills: '', experience_years: 0, location: '' });
                setFormMsg({ text: '', type: '' });
            }, 1500);
        } catch (error) {
            setFormMsg({ text: 'Error saving job.', type: 'error' });
        }
    };

    const handleEditClick = (job) => {
        setJobForm({
            job_title: job.job_title,
            description: job.description,
            skills: job.requirements.skills.join(', '),
            experience_years: job.requirements.experience_years,
            location: job.location
        });
        setEditingJobId(job._id);
        setShowJobForm(true);
    };

    const handleDeleteJob = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this job?')) return;
        try {
            await API.delete(`/jobs/${id}`);
            setMyJobs(myJobs.filter((j) => j._id !== id));
        } catch (error) {
            alert('Failed to delete job.');
        }
    };

    const handleSelectJob = async (job) => {
        setSelectedJob(job);
        try {
            const { data } = await API.get(`/applications/job/${job._id}`);
            setApplicants(data.sort((a, b) => b.ai_match_score - a.ai_match_score));
        } catch (error) {
            console.error('Error selecting job:', error);
        }
    };

    const updateAppStatus = async (appId, newStatus) => {
        try {
            await API.put(`/applications/${appId}/status`, { status: newStatus });
            setApplicants(applicants.map((app) => (app._id === appId ? { ...app, status: newStatus } : app)));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        if (setUser) setUser(null);
        navigate('/login');
    };

    const sidebarItems = [
        { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'jobs', label: 'Job Management', icon: Briefcase },
        { id: 'ats', label: 'Applicant Tracking', icon: Users },
        { id: 'analytics', label: 'Hiring Analytics', icon: PieChartIcon }
    ];

    const renderOverview = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-indigo-900 rounded-2xl p-8 shadow-sm text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">Welcome Back!</h2>
                    <p className="text-indigo-200">Here is a quick snapshot of your recruitment pipeline.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="bg-indigo-100 p-4 rounded-xl text-indigo-600"><Briefcase className="h-8 w-8" /></div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Active Jobs</p>
                        <h3 className="text-3xl font-black text-slate-900">{analytics?.active_jobs || 0}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600"><Users className="h-8 w-8" /></div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Candidates</p>
                        <h3 className="text-3xl font-black text-slate-900">{analytics?.funnel?.total_applied || 0}</h3>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderJobManagement = () => {
        if (showJobForm) {
            return (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in max-w-4xl">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">{editingJobId ? 'Edit Job Posting' : 'Create New Job Requisition'}</h2>
                        <button onClick={() => { setShowJobForm(false); setEditingJobId(null); setJobForm({ job_title: '', description: '', skills: '', experience_years: 0, location: '' }); }} className="text-slate-500 hover:text-slate-700 font-medium text-sm">Cancel & Return</button>
                    </div>
                    {formMsg.text && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                            {formMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />} {formMsg.text}
                        </div>
                    )}
                    <form onSubmit={handleSaveJob} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-700 mb-2">Job Title</label><input type="text" required value={jobForm.job_title} onChange={(e) => setJobForm({ ...jobForm, job_title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-600 outline-none" /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Location</label><input type="text" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-600 outline-none" /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Minimum Experience (Years)</label><input type="number" min="0" required value={jobForm.experience_years} onChange={(e) => setJobForm({ ...jobForm, experience_years: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-600 outline-none" /></div>
                            <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-700 mb-2">Required Skills (Comma separated)</label><input type="text" required value={jobForm.skills} onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-600 outline-none" /></div>
                            <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-700 mb-2">Job Description</label><textarea required rows="6" value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-600 outline-none resize-none" /></div>
                        </div>
                        <div className="pt-4 border-t border-slate-200 flex justify-end"><button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all">{editingJobId ? 'Update Job Posting' : 'Submit Job'}</button></div>
                    </form>
                </div>
            );
        }
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div><h2 className="text-xl font-bold text-slate-900">Your Requisitions</h2></div>
                    <button onClick={() => setShowJobForm(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Post New Job</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {myJobs.map((job) => (
                        <div key={job._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="grow">
                                <div className="flex items-center gap-3 mb-1"><h3 className="text-xl font-bold text-slate-900">{job.job_title}</h3><span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-600">{job.status}</span></div>
                                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium mb-3">
                                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location || 'Remote'}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {job.requirements?.experience_years || 0}+ Years Exp.</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">{job.requirements?.skills?.slice(0, 5).map((s, i) => <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-bold">{s}</span>)}</div>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button onClick={() => handleEditClick(job)} className="flex-1 bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-bold hover:bg-slate-100 flex justify-center items-center gap-2"><Edit3 className="h-4 w-4" /> Edit</button>
                                <button onClick={() => handleDeleteJob(job._id)} className="flex-1 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-bold hover:bg-red-100 flex justify-center items-center gap-2"><Trash2 className="h-4 w-4" /> Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderATS = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit max-h-200 overflow-y-auto">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Select a Job</h2>
                {myJobs.length === 0 ? <p className="text-slate-500 text-sm">No jobs posted yet.</p> : (
                    <div className="space-y-4">
                        {myJobs.map((job) => (
                            <div key={job._id} onClick={() => handleSelectJob(job)} className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedJob?._id === job._id ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-600' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                <h3 className="font-bold text-slate-900 truncate">{job.job_title}</h3>
                                <p className="text-xs text-slate-500 mt-2 font-bold uppercase">{job.status}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="lg:col-span-2">
                {selectedJob ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-end">
                            <h2 className="text-2xl font-bold text-slate-900">{selectedJob.job_title}</h2>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase">Applicants</p>
                                <p className="text-2xl font-black text-indigo-600">{applicants.length}</p>
                            </div>
                        </div>
                        {applicants.length === 0 ? (
                            <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No candidates have applied yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applicants.map((app, index) => (
                                    <div key={app._id} className="p-6 rounded-xl border border-slate-200 hover:shadow-md bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex items-center gap-6 w-full md:w-1/3">
                                            <div className="text-center">
                                                <div className="text-xs font-bold text-slate-400 mb-1">Rank</div>
                                                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-700">#{index + 1}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">AI Match</div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-black shadow-sm ${app.ai_match_score >= 80 ? 'bg-emerald-100 text-emerald-800' : app.ai_match_score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{app.ai_match_score}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-1/3"><p className="font-bold text-slate-900">{app.seeker_id?.email || 'Candidate'}</p></div>
                                        <div className="w-full md:w-1/3 flex flex-col items-end gap-2">
                                            <span className="text-xs font-bold uppercase text-slate-400">Current: {app.status}</span>
                                            <div className="flex gap-2">
                                                {app.status === 'applied' && <button onClick={() => updateAppStatus(app._id, 'shortlisted')} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1 hover:bg-indigo-100"><Star className="h-4 w-4" /> Shortlist</button>}
                                                {app.status === 'shortlisted' && <button onClick={() => updateAppStatus(app._id, 'interviewing')} className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1 hover:bg-emerald-100"><Calendar className="h-4 w-4" /> Schedule</button>}
                                                <button
                                                    onClick={() => handleGenerateGuide(app._id)}
                                                    className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1 hover:bg-purple-100 transition-colors"
                                                >
                                                    <BrainCircuit className="h-4 w-4" /> AI Copilot
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-slate-100 rounded-2xl p-12 text-center border border-slate-200 h-full flex flex-col justify-center items-center">
                        <Briefcase className="h-16 w-16 text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Select a Job Posting</h3>
                    </div>
                )}
            </div>
        </div>
    );

    const renderAnalytics = () => {
        if (!analytics) return <div className="p-12 text-center text-slate-500">Loading analytics...</div>;

        const funnelData = {
            labels: ['Pending Review', 'Shortlisted', 'Interviewing'],
            datasets: [{
                data: [analytics.funnel.pending, analytics.funnel.shortlisted, analytics.funnel.interviewing],
                backgroundColor: ['#f59e0b', '#6366f1', '#10b981'],
                borderWidth: 0
            }]
        };

        const scoreData = {
            labels: ['Excellent (80%+)', 'Good (60-79%)', 'Average (40-59%)', 'Poor (<40%)'],
            datasets: [{
                label: 'Candidate Volume',
                data: [analytics.scoreDistribution.excellent, analytics.scoreDistribution.good, analytics.scoreDistribution.average, analytics.scoreDistribution.poor],
                backgroundColor: '#4f46e5',
                borderRadius: 6
            }]
        };

        return (
            <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Candidate Quality (AI Scores)</h3>
                        <div className="h-64 flex justify-center"><Bar data={scoreData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Hiring Funnel</h3>
                        <div className="h-64 flex justify-center"><Doughnut data={funnelData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen w-full bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            <aside className="w-full md:w-72 bg-white border-r border-slate-200 shadow-sm flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Employer Portal</h2>
                    <p className="text-sm font-medium text-indigo-600 mt-1">AI Talent Acquisition</p>
                </div>
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button key={item.id} onClick={() => { setActiveTab(item.id); setShowJobForm(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`} /> {item.label}
                            </button>
                        );
                    })}
                </nav>

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

            <main className="flex-1 h-full w-full overflow-y-auto p-6 md:p-10">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900">{sidebarItems.find((item) => item.id === activeTab)?.label}</h1>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-64"><TrendingUp className="h-8 w-8 text-indigo-600 animate-bounce" /></div>
                    ) : (
                        <>
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'jobs' && renderJobManagement()}
                            {activeTab === 'ats' && renderATS()}
                            {activeTab === 'analytics' && renderAnalytics()}
                        </>
                    )}
                </div>
            </main>

            {/* AI INTERVIEW COPILOT MODAL */}
            {showGuideModal && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowGuideModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                            <X className="h-6 w-6" />
                        </button>

                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <div className="bg-purple-100 p-3 rounded-xl"><BrainCircuit className="h-6 w-6 text-purple-600" /></div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">AI Interview Copilot</h2>
                                <p className="text-sm font-medium text-purple-600">Generated dynamically based on skill gap analysis</p>
                            </div>
                        </div>

                        {guideLoading ? (
                            <div className="py-12 text-center text-slate-500 flex flex-col items-center">
                                <BrainCircuit className="h-10 w-10 text-purple-400 animate-pulse mb-3" />
                                Analyzing Candidate Profile...
                            </div>
                        ) : interviewGuide ? (
                            <div className="space-y-6">
                                {interviewGuide.questions.map((q, idx) => (
                                    <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                        <span className="text-xs font-black uppercase tracking-wider text-purple-600 mb-2 block">{q.category}</span>
                                        <p className="font-bold text-slate-900 mb-3 text-lg leading-relaxed">{q.question}</p>
                                        <div className="bg-white p-3 rounded-lg border border-slate-100 text-sm text-slate-600 flex items-start gap-2">
                                            <span className="font-bold text-slate-800">Intent:</span> {q.intent}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterDashboard;
