import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';
import {
    LayoutDashboard, Briefcase, Users, PieChart as PieChartIcon,
    Plus, Edit3, Trash2, MapPin, Clock, Building2, CheckCircle2,
    AlertCircle, TrendingUp, Star, Calendar, MessageSquare, XCircle, LogOut, BrainCircuit, X, Lightbulb
} from 'lucide-react';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const RecruiterDashboard = () => {
    const { setUser } = useContext(AuthContext);
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

    const fetchDashboardData = useCallback(async () => {
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
    }, [activeTab, selectedJob]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleGenerateGuide = async (appId) => {
        setGuideLoading(true);
        setShowGuideModal(true);
        try {
            const { data } = await API.get(`/applications/${appId}/interview-guide`);
            setInterviewGuide(data);
        } catch {
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
        } catch {
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
        } catch {
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
        <div className="space-y-8 animate-fade-in">
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 rounded-2xl p-10 shadow-md text-white">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
                        <p className="text-indigo-200 font-medium text-lg">Here's a snapshot of your recruitment pipeline and candidate flow.</p>
                    </div>
                    <div className="bg-indigo-800 border border-indigo-700 backdrop-blur-sm px-6 py-4 rounded-2xl min-w-max">
                        <p className="text-xs uppercase font-bold text-indigo-300 mb-1 tracking-wider">Total in Pipeline</p>
                        <p className="text-4xl font-black text-white">{analytics?.funnel?.total_applied || 0}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active Jobs Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl shadow-sm border border-indigo-100 hover:shadow-md transition-all duration-300 hover:border-indigo-200 group">
                    <div className="flex items-start justify-between mb-6">
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-xl text-white shadow-md group-hover:shadow-lg transition-all">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <div className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-lg">Live Now</div>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Active Postings</p>
                    <h3 className="text-4xl font-black text-slate-900 mb-4">{analytics?.active_jobs || 0}</h3>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600" style={{ width: `${Math.min((analytics?.active_jobs || 0) * 25, 100)}%` }}></div>
                    </div>
                </div>

                {/* Total Candidates Card */}
                <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition-all duration-300 hover:border-emerald-200 group">
                    <div className="flex items-start justify-between mb-6">
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-xl text-white shadow-md group-hover:shadow-lg transition-all">
                            <Users className="h-6 w-6" />
                        </div>
                        <div className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">Growing</div>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Total Applicants</p>
                    <h3 className="text-4xl font-black text-slate-900 mb-4">{analytics?.funnel?.total_applied || 0}</h3>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: '85%' }}></div>
                    </div>
                </div>

                {/* AI Match Score Card */}
                <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-2xl shadow-sm border border-amber-100 hover:shadow-md transition-all duration-300 hover:border-amber-200 group">
                    <div className="flex items-start justify-between mb-6">
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-xl text-white shadow-md group-hover:shadow-lg transition-all">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div className="text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-lg">Insight</div>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Avg AI Match</p>
                    <h3 className="text-4xl font-black text-slate-900 mb-4">72%</h3>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600" style={{ width: '72%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderJobManagement = () => {
        if (showJobForm) {
            return (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in max-w-4xl">
                    <div className="bg-gradient-to-r from-slate-50 to-indigo-50 px-8 py-8 border-b border-slate-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-1">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <Briefcase className="h-6 w-6 text-indigo-600" />
                                </div>
                                {editingJobId ? 'Edit Job Posting' : 'Create New Job Requisition'}
                            </h2>
                            <p className="text-slate-600 font-medium text-sm">Define the role, requirements, and skills needed.</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowJobForm(false);
                                setEditingJobId(null);
                                setJobForm({ job_title: '', description: '', skills: '', experience_years: 0, location: '' });
                            }}
                            className="text-slate-500 hover:text-slate-700 font-bold text-sm flex items-center gap-1"
                        >
                            <X className="h-5 w-5" /> Cancel
                        </button>
                    </div>

                    <div className="p-8 md:p-10">
                        {formMsg.text && (
                            <div className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-start gap-3 border ${formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                                {formMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                                <span>{formMsg.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveJob} className="space-y-8">
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-800">Job Title</label>
                                <input
                                    type="text"
                                    required
                                    value={jobForm.job_title}
                                    onChange={(e) => setJobForm({ ...jobForm, job_title: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium text-slate-800"
                                    placeholder="e.g., Senior Full-Stack Developer"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 pt-8">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-800">Location</label>
                                    <input
                                        type="text"
                                        value={jobForm.location}
                                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium text-slate-800"
                                        placeholder="e.g., Islamabad, Pakistan or Remote"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-800">Minimum Experience (Years)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={jobForm.experience_years}
                                        onChange={(e) => setJobForm({ ...jobForm, experience_years: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 border-t border-slate-200 pt-8">
                                <label className="block text-sm font-bold text-slate-800">Required Skills (Comma separated)</label>
                                <input
                                    type="text"
                                    required
                                    value={jobForm.skills}
                                    onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium text-slate-800"
                                    placeholder="React, Node.js, PostgreSQL, TypeScript, Git..."
                                />
                            </div>

                            <div className="space-y-3 border-t border-slate-200 pt-8">
                                <label className="block text-sm font-bold text-slate-800">Job Description</label>
                                <textarea
                                    required
                                    rows="6"
                                    value={jobForm.description}
                                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none font-medium text-slate-800"
                                    placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                                />
                            </div>

                            <div className="pt-8 border-t border-slate-200 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <CheckCircle2 className="h-5 w-5" />
                                    {editingJobId ? 'Update Job Posting' : 'Submit Job Requisition'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-indigo-600" />
                            Your Job Requisitions
                        </h2>
                        <p className="text-slate-600 font-medium text-sm mt-1">Manage and post new job openings</p>
                    </div>
                    <button
                        onClick={() => setShowJobForm(true)}
                        className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="h-5 w-5" />
                        Post New Job
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    {myJobs.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                            <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No Job Postings Yet</h3>
                            <p className="text-slate-600 font-medium">Click "Post New Job" to create your first posting and start attracting candidates.</p>
                        </div>
                    ) : (
                        myJobs.map((job) => (
                            <div
                                key={job._id}
                                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 overflow-hidden group"
                            >
                                <div className="p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.job_title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${job.status === 'active' ? 'bg-emerald-100 text-emerald-800' : job.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                                                    {job.status || 'Active'}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium mb-4">
                                                <span className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-slate-400" />
                                                    {job.location || 'Remote'}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-slate-400" />
                                                    {job.requirements?.experience_years || 0}+ Yrs Experience
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {job.requirements?.skills?.slice(0, 6).map((s, i) => (
                                                    <span key={i} className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-200 transition-colors">
                                                        {s}
                                                    </span>
                                                ))}
                                                {job.requirements?.skills?.length > 6 && (
                                                    <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-lg font-bold">
                                                        +{job.requirements.skills.length - 6}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-3 w-full md:w-auto md:flex-col lg:flex-row">
                                            <button
                                                onClick={() => handleEditClick(job)}
                                                className="flex-1 md:flex-none bg-slate-50 text-slate-700 border border-slate-200 px-5 py-3 rounded-xl font-bold hover:bg-slate-100 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteJob(job._id)}
                                                className="flex-1 md:flex-none bg-red-50 text-red-600 border border-red-200 px-5 py-3 rounded-xl font-bold hover:bg-red-100 hover:border-red-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const renderATS = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Job Selector Sidebar */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-fit lg:max-h-[600px]">
                <div className="bg-gradient-to-r from-slate-50 to-slate-25 px-6 py-6 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                        <Briefcase className="h-5 w-5 text-indigo-600" />
                        Active Jobs
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">Select a job to view applicants</p>
                </div>
                {myJobs.length === 0 ? (
                    <div className="p-6 text-center">
                        <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-600 font-medium">No job postings yet.</p>
                    </div>
                ) : (
                    <div className="overflow-y-auto flex-1 p-4 space-y-2">
                        {myJobs.map((job) => (
                            <button
                                key={job._id}
                                onClick={() => handleSelectJob(job)}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left font-semibold ${selectedJob?._id === job._id
                                    ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="font-bold text-slate-900 truncate">{job.job_title}</div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {job.applicantCount || 0} applicants
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Applicant Pipeline */}
            <div className="lg:col-span-2">
                {selectedJob ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                        <div className="bg-gradient-to-r from-slate-50 to-indigo-50 px-8 py-6 border-b border-slate-200 flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">{selectedJob.job_title}</h2>
                                <p className="text-slate-600 font-medium text-sm">{selectedJob.location || 'Remote'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Total Applicants</p>
                                <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl">
                                    <p className="text-2xl font-black">{applicants.length}</p>
                                </div>
                            </div>
                        </div>

                        {applicants.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center p-12">
                                <div className="text-center">
                                    <div className="bg-slate-100 rounded-2xl p-6 inline-block mb-4">
                                        <Users className="h-12 w-12 text-slate-400" />
                                    </div>
                                    <p className="text-slate-600 font-medium text-lg">No applicants yet</p>
                                    <p className="text-slate-500 text-sm mt-1">Check back soon as candidates apply to this role.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
                                {applicants.map((app, index) => (
                                    <div
                                        key={app._id}
                                        className="p-6 md:p-7 hover:bg-slate-50 transition-colors group border-b border-slate-100 last:border-b-0"
                                    >
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            {/* Rank & Match Score */}
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <div className="text-xs font-bold text-slate-400 mb-2">Rank</div>
                                                    <div className="h-12 w-12 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center font-black text-indigo-700 border border-indigo-200">
                                                        #{index + 1}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">AI Match Score</div>
                                                    <div className={`px-4 py-2 rounded-lg text-sm font-black inline-block ${app.ai_match_score >= 80 ? 'bg-emerald-100 text-emerald-800' : app.ai_match_score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                                        {app.ai_match_score}%
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Candidate Email */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-slate-900 font-bold truncate">{app.seeker_id?.email || 'Candidate'}</p>
                                                <p className="text-xs text-slate-500 font-medium mt-1">{app.seeker_id?.firstName} {app.seeker_id?.lastName}</p>
                                            </div>

                                            {/* Status & Actions */}
                                            <div className="w-full md:w-auto flex flex-col items-end gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 ${app.status === 'shortlisted'
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : app.status === 'interviewing'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : app.status === 'rejected'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        <div className={`w-2 h-2 rounded-full ${app.status === 'shortlisted'
                                                            ? 'bg-indigo-600'
                                                            : app.status === 'interviewing'
                                                                ? 'bg-emerald-600'
                                                                : app.status === 'rejected'
                                                                    ? 'bg-red-600'
                                                                    : 'bg-amber-600'
                                                            }`}></div>
                                                        {app.status}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 flex-wrap justify-end">
                                                    {app.status === 'applied' && (
                                                        <button
                                                            onClick={() => updateAppStatus(app._id, 'shortlisted')}
                                                            className="bg-indigo-50 text-indigo-700 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition-colors shadow-sm"
                                                        >
                                                            <Star className="h-4 w-4" /> Shortlist
                                                        </button>
                                                    )}
                                                    {app.status === 'shortlisted' && (
                                                        <button
                                                            onClick={() => updateAppStatus(app._id, 'interviewing')}
                                                            className="bg-emerald-50 text-emerald-700 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors shadow-sm"
                                                        >
                                                            <Calendar className="h-4 w-4" /> Interview
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleGenerateGuide(app._id)}
                                                        className="bg-purple-50 text-purple-700 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-purple-100 transition-colors shadow-sm"
                                                    >
                                                        <BrainCircuit className="h-4 w-4" /> AI Guide
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-slate-100 rounded-2xl p-16 text-center border border-slate-200 h-full flex flex-col justify-center items-center">
                        <div className="bg-white rounded-2xl p-8 inline-block mb-4">
                            <Briefcase className="h-14 w-14 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Job Posting</h3>
                        <p className="text-slate-600 font-medium">Choose a job from the left sidebar to view its applicants.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderAnalytics = () => {
        if (!analytics) return <div className="p-12 text-center text-slate-500 font-medium text-lg">Loading analytics...</div>;

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
                backgroundColor: '#6366f1',
                borderRadius: 8,
                borderSkipped: false
            }]
        };

        return (
            <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Candidate Quality Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="bg-gradient-to-r from-slate-50 to-slate-25 px-8 py-6 border-b border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-1">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                                </div>
                                Candidate Quality Distribution
                            </h3>
                            <p className="text-sm text-slate-600 font-medium">AI match score breakdown across all applicants</p>
                        </div>
                        <div className="flex-1 p-8 flex items-center justify-center min-h-80">
                            <div className="w-full">
                                <Bar data={scoreData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }} />
                            </div>
                        </div>
                    </div>

                    {/* Hiring Funnel Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="bg-gradient-to-r from-slate-50 to-emerald-50 px-8 py-6 border-b border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-1">
                                <div className="bg-emerald-100 p-2 rounded-lg">
                                    <Users className="h-5 w-5 text-emerald-600" />
                                </div>
                                Hiring Pipeline Funnel
                            </h3>
                            <p className="text-sm text-slate-600 font-medium">Candidate progression through hiring stages</p>
                        </div>
                        <div className="flex-1 p-8 flex items-center justify-center min-h-80">
                            <div className="w-full flex justify-center">
                                <Doughnut data={funnelData} options={{ responsive: true, maintainAspectRatio: true }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-2xl shadow-sm border border-amber-100">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-amber-100 p-3 rounded-lg">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">Pending</span>
                        </div>
                        <p className="text-sm font-bold text-slate-600 uppercase mb-1">Under Review</p>
                        <p className="text-3xl font-black text-slate-900">{analytics?.funnel?.pending || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-indigo-100 p-3 rounded-lg">
                                <Star className="h-5 w-5 text-indigo-600" />
                            </div>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-lg">Qualified</span>
                        </div>
                        <p className="text-sm font-bold text-slate-600 uppercase mb-1">Shortlisted</p>
                        <p className="text-3xl font-black text-slate-900">{analytics?.funnel?.shortlisted || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-emerald-100 p-3 rounded-lg">
                                <Calendar className="h-5 w-5 text-emerald-600" />
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">Active</span>
                        </div>
                        <p className="text-sm font-bold text-slate-600 uppercase mb-1">Interviewing</p>
                        <p className="text-3xl font-black text-slate-900">{analytics?.funnel?.interviewing || 0}</p>
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
                <div className="fixed inset-0 bg-slate-900 bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-8 text-white flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                                    <BrainCircuit className="h-7 w-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">AI Interview Copilot</h2>
                                    <p className="text-purple-100 font-medium text-sm">Skill-gap analysis & personalized interview questions</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowGuideModal(false)}
                                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="overflow-y-auto flex-1 p-8">
                            {guideLoading ? (
                                <div className="py-16 text-center flex flex-col items-center justify-center">
                                    <div className="inline-block">
                                        <BrainCircuit className="h-12 w-12 text-purple-400 animate-pulse mb-4" />
                                    </div>
                                    <p className="text-slate-600 font-bold text-lg">Analyzing Candidate Profile...</p>
                                    <p className="text-slate-500 text-sm mt-2">Generating personalized interview questions based on skill gaps</p>
                                </div>
                            ) : interviewGuide ? (
                                <div className="space-y-5">
                                    {interviewGuide.questions.map((q, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-gradient-to-br from-slate-50 to-slate-25 p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-4 gap-4">
                                                <span className="text-xs font-black uppercase tracking-widest text-purple-700 bg-purple-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
                                                    {q.category}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Q{idx + 1}</span>
                                            </div>
                                            <p className="font-bold text-slate-900 mb-4 text-base leading-relaxed group-hover:text-purple-700 transition-colors">
                                                {q.question}
                                            </p>
                                            <div className="bg-white p-4 rounded-lg border border-slate-200 text-slate-700 text-sm flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-800">Interview Tip:</span>
                                                    <p className="mt-1">{q.intent}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 border-t border-slate-200 px-8 py-4 flex justify-end">
                            <button
                                onClick={() => setShowGuideModal(false)}
                                className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-6 py-2.5 rounded-lg font-bold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterDashboard;
