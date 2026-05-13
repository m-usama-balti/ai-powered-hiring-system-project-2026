import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    PieChart as PieChartIcon,
    Plus,
    Edit3,
    Trash2,
    MapPin,
    Clock,
    Building2,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Star,
    Calendar,
    XCircle,
    LogOut,
    BrainCircuit,
    X,
    Lightbulb
} from 'lucide-react';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const APPLICATION_STATUS_ORDER = ['applied', 'shortlisted', 'interviewing', 'hired', 'rejected'];

const APPLICATION_STATUS_META = {
    applied: {
        label: 'Applied',
        columnClass: 'border-slate-700 bg-slate-900/70',
        headerClass: 'from-slate-800 to-slate-900',
        badgeClass: 'bg-slate-500/15 text-slate-200 border-slate-500/20',
        dotClass: 'bg-slate-400',
        accentClass: 'from-slate-500 to-slate-400'
    },
    shortlisted: {
        label: 'Shortlisted',
        columnClass: 'border-indigo-700/40 bg-indigo-950/35',
        headerClass: 'from-indigo-900 to-indigo-950',
        badgeClass: 'bg-indigo-500/15 text-indigo-200 border-indigo-400/20',
        dotClass: 'bg-indigo-400',
        accentClass: 'from-indigo-500 to-indigo-400'
    },
    interviewing: {
        label: 'Interviewing',
        columnClass: 'border-amber-700/40 bg-amber-950/30',
        headerClass: 'from-amber-900 to-amber-950',
        badgeClass: 'bg-amber-500/15 text-amber-200 border-amber-400/20',
        dotClass: 'bg-amber-400',
        accentClass: 'from-amber-500 to-amber-400'
    },
    hired: {
        label: 'Hired',
        columnClass: 'border-emerald-700/40 bg-emerald-950/30',
        headerClass: 'from-emerald-900 to-emerald-950',
        badgeClass: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20',
        dotClass: 'bg-emerald-400',
        accentClass: 'from-emerald-500 to-emerald-400'
    },
    rejected: {
        label: 'Rejected',
        columnClass: 'border-rose-700/40 bg-rose-950/30',
        headerClass: 'from-rose-900 to-rose-950',
        badgeClass: 'bg-rose-500/15 text-rose-200 border-rose-400/20',
        dotClass: 'bg-rose-400',
        accentClass: 'from-rose-500 to-rose-400'
    }
};

const STATUS_OPTIONS = APPLICATION_STATUS_ORDER.map((status) => ({
    value: status,
    label: APPLICATION_STATUS_META[status].label
}));

const DEFAULT_ANALYTICS = {
    active_jobs: 0,
    pending_jobs: 0,
    funnel: {
        total_applied: 0,
        pending: 0,
        shortlisted: 0,
        interviewing: 0,
        hired: 0,
        rejected: 0
    },
    scoreDistribution: {
        excellent: 0,
        good: 0,
        average: 0,
        poor: 0
    },
    recent_activity: []
};

const formatStatusLabel = (status) => APPLICATION_STATUS_META[status]?.label || 'Applied';
const normalizeStatus = (status) => String(status || 'applied').trim().toLowerCase();
const formatSkills = (skills = []) => skills
    .filter(Boolean)
    .map((skill) => String(skill).trim())
    .filter(Boolean);

const getCandidateName = (application) => {
    const profileName = [application.seeker_id?.profile?.name, application.seeker_id?.firstName, application.seeker_id?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
    return profileName || application.seeker_id?.email || 'Candidate';
};

const scoreTone = (score) => {
    if (score >= 90) return 'from-emerald-400 to-emerald-500 text-slate-950 shadow-emerald-500/30';
    if (score >= 75) return 'from-cyan-400 to-cyan-500 text-slate-950 shadow-cyan-500/30';
    if (score >= 60) return 'from-amber-400 to-amber-500 text-slate-950 shadow-amber-500/30';
    return 'from-rose-400 to-rose-500 text-white shadow-rose-500/30';
};

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
    const [analytics, setAnalytics] = useState(DEFAULT_ANALYTICS);
    const [interviewGuide, setInterviewGuide] = useState(null);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [guideLoading, setGuideLoading] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const promises = [];
            const wantJobs = ['jobs', 'ats'].includes(activeTab);
            const wantAnalytics = ['overview', 'analytics'].includes(activeTab);

            if (wantJobs) {
                promises.push(API.get('/jobs/me'));
            }
            if (wantAnalytics) {
                promises.push(API.get('/jobs/analytics'));
            }

            const results = await Promise.allSettled(promises);
            let resultIndex = 0;

            if (wantJobs) {
                const jobsResult = results[resultIndex++];
                if (jobsResult.status === 'fulfilled') {
                    const jobs = jobsResult.value.data || [];
                    setMyJobs(jobs);
                    if (activeTab === 'ats' && jobs.length > 0 && !selectedJob) {
                        await handleSelectJob(jobs[0]);
                    }
                }
            }

            if (wantAnalytics) {
                const analyticsResult = results[resultIndex++];
                if (analyticsResult.status === 'fulfilled' && analyticsResult.value.data) {
                    setAnalytics(analyticsResult.value.data);
                }
            }
        } catch (error) {
            console.error('Error fetching recruiter dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleGenerateGuide = async (applicationId) => {
        setGuideLoading(true);
        setShowGuideModal(true);
        try {
            const { data } = await API.get(`/applications/${applicationId}/interview-guide`);
            setInterviewGuide(data);
        } catch {
            alert('Failed to generate AI guide.');
            setShowGuideModal(false);
        } finally {
            setGuideLoading(false);
        }
    };

    const handleSaveJob = async (event) => {
        event.preventDefault();
        setFormMsg({ text: 'Saving...', type: 'info' });
        try {
            const payload = {
                job_title: jobForm.job_title,
                description: jobForm.description,
                location: jobForm.location || 'Remote',
                requirements: {
                    skills: jobForm.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
                    experience_years: Number(jobForm.experience_years) || 0
                }
            };

            if (editingJobId) {
                await API.put(`/jobs/${editingJobId}`, payload);
                setFormMsg({ text: 'Job updated successfully!', type: 'success' });
            } else {
                await API.post('/jobs', payload);
                setFormMsg({ text: 'Job created successfully!', type: 'success' });
            }

            await fetchDashboardData();
            setTimeout(() => {
                setShowJobForm(false);
                setEditingJobId(null);
                setJobForm({ job_title: '', description: '', skills: '', experience_years: 0, location: '' });
                setFormMsg({ text: '', type: '' });
            }, 1000);
        } catch {
            setFormMsg({ text: 'Error saving job.', type: 'error' });
        }
    };

    const handleEditClick = (job) => {
        setJobForm({
            job_title: job.job_title,
            description: job.description,
            skills: (job.requirements?.skills || []).join(', '),
            experience_years: job.requirements?.experience_years || 0,
            location: job.location || ''
        });
        setEditingJobId(job._id);
        setShowJobForm(true);
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to permanently delete this job?')) return;
        try {
            await API.delete(`/jobs/${jobId}`);
            setMyJobs((currentJobs) => currentJobs.filter((job) => job._id !== jobId));
        } catch {
            alert('Failed to delete job.');
        }
    };

    const handleSelectJob = async (job) => {
        setSelectedJob(job);
        try {
            const { data } = await API.get(`/applications/job/${job._id}`);
            setApplicants((data || []).sort((left, right) => Number(right.ai_match_score || 0) - Number(left.ai_match_score || 0)));
        } catch (error) {
            console.error('Error selecting job:', error);
            setApplicants([]);
        }
    };

    const updateAppStatus = async (applicationId, newStatus) => {
        const normalizedStatus = normalizeStatus(newStatus);
        try {
            await API.put(`/applications/${applicationId}/status`, { status: normalizedStatus });
            setApplicants((currentApplicants) => currentApplicants.map((application) => (
                application._id === applicationId
                    ? { ...application, status: normalizedStatus }
                    : application
            )));
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
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-slate-950/30 text-white">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                            Recruiter Command Center
                        </div>
                        <h2 className="mt-4 text-3xl font-black md:text-4xl">Welcome Back</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                            Track applications, review candidates, and move talent through your hiring pipeline.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-6 py-4">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Total in Pipeline</p>
                        <p className="mt-2 text-4xl font-black text-white">{analytics?.funnel?.total_applied || 0}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div className="rounded-xl bg-indigo-500/10 p-3 border border-indigo-400/20">
                            <Briefcase className="h-6 w-6 text-indigo-300" />
                        </div>
                        <span className="rounded-lg bg-indigo-500/10 px-2 py-1 text-xs font-bold text-indigo-300">Live Now</span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Active Postings</p>
                    <p className="text-4xl font-black text-white">{analytics?.active_jobs || 0}</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div className="rounded-xl bg-emerald-500/10 p-3 border border-emerald-400/20">
                            <Users className="h-6 w-6 text-emerald-300" />
                        </div>
                        <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-300">Growing</span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Total Applicants</p>
                    <p className="text-4xl font-black text-white">{analytics?.funnel?.total_applied || 0}</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div className="rounded-xl bg-amber-500/10 p-3 border border-amber-400/20">
                            <TrendingUp className="h-6 w-6 text-amber-300" />
                        </div>
                        <span className="rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-300">Insight</span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Shortlisted</p>
                    <p className="text-4xl font-black text-white">{analytics?.funnel?.shortlisted || 0}</p>
                </div>
            </div>
        </div>
    );

    const renderJobManagement = () => {
        if (showJobForm) {
            return (
                <div className="max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-slate-950/30">
                    <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
                        <div>
                            <h2 className="mb-1 flex items-center gap-3 text-2xl font-bold text-white">
                                <div className="rounded-lg bg-cyan-500/10 p-2 border border-cyan-400/20">
                                    <Briefcase className="h-6 w-6 text-cyan-300" />
                                </div>
                                {editingJobId ? 'Edit Job Posting' : 'Create New Job Requisition'}
                            </h2>
                            <p className="text-sm font-medium text-slate-400">Define the role, requirements, and skills needed.</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowJobForm(false);
                                setEditingJobId(null);
                                setJobForm({ job_title: '', description: '', skills: '', experience_years: 0, location: '' });
                            }}
                            className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                            Cancel
                        </button>
                    </div>

                    <div className="p-6 md:p-8">
                        {formMsg.text && (
                            <div className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm font-semibold ${formMsg.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' : formMsg.type === 'error' ? 'border-rose-500/20 bg-rose-500/10 text-rose-200' : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200'}`}>
                                {formMsg.type === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />}
                                <span>{formMsg.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveJob} className="space-y-8">
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-200">Job Title</label>
                                <input
                                    type="text"
                                    required
                                    value={jobForm.job_title}
                                    onChange={(event) => setJobForm({ ...jobForm, job_title: event.target.value })}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                                    placeholder="e.g., Senior Full-Stack Developer"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 border-t border-slate-800 pt-8 md:grid-cols-2">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-200">Location</label>
                                    <input
                                        type="text"
                                        value={jobForm.location}
                                        onChange={(event) => setJobForm({ ...jobForm, location: event.target.value })}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                                        placeholder="e.g., Islamabad, Pakistan or Remote"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-200">Minimum Experience (Years)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={jobForm.experience_years}
                                        onChange={(event) => setJobForm({ ...jobForm, experience_years: event.target.value })}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 border-t border-slate-800 pt-8">
                                <label className="block text-sm font-bold text-slate-200">Required Skills (Comma separated)</label>
                                <input
                                    type="text"
                                    required
                                    value={jobForm.skills}
                                    onChange={(event) => setJobForm({ ...jobForm, skills: event.target.value })}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                                    placeholder="React, Node.js, PostgreSQL, TypeScript, Git..."
                                />
                            </div>

                            <div className="space-y-3 border-t border-slate-800 pt-8">
                                <label className="block text-sm font-bold text-slate-200">Job Description</label>
                                <textarea
                                    required
                                    rows="6"
                                    value={jobForm.description}
                                    onChange={(event) => setJobForm({ ...jobForm, description: event.target.value })}
                                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                                    placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                                />
                            </div>

                            <div className="flex justify-end border-t border-slate-800 pt-8">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-8 py-4 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-indigo-400"
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
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-lg">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                            <Building2 className="h-6 w-6 text-cyan-400" />
                            Your Job Requisitions
                        </h2>
                        <p className="mt-1 text-sm font-medium text-slate-400">Manage and post new job openings</p>
                    </div>
                    <button
                        onClick={() => setShowJobForm(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-indigo-400"
                    >
                        <Plus className="h-5 w-5" />
                        Post New Job
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    {myJobs.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/80 p-12 text-center">
                            <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                            <h3 className="mb-2 text-lg font-bold text-white">No Job Postings Yet</h3>
                            <p className="font-medium text-slate-400">Click "Post New Job" to create your first posting and start attracting candidates.</p>
                        </div>
                    ) : (
                        myJobs.map((job) => (
                            <div key={job._id} className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-lg transition hover:border-slate-700 hover:shadow-xl">
                                <div className="p-6 md:p-8">
                                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                        <div className="flex-1">
                                            <div className="mb-3 flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-white transition-colors group-hover:text-cyan-300">{job.job_title}</h3>
                                                <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${job.status === 'active' ? 'bg-emerald-500/10 text-emerald-300' : job.status === 'pending' ? 'bg-amber-500/10 text-amber-300' : 'bg-slate-700 text-slate-300'}`}>
                                                    {job.status || 'Active'}
                                                </span>
                                            </div>

                                            <div className="mb-4 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-400">
                                                <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-500" /> {job.location || 'Remote'}</span>
                                                <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-500" /> {job.requirements?.experience_years || 0}+ Yrs Experience</span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {(job.requirements?.skills || []).slice(0, 6).map((skill, index) => (
                                                    <span key={index} className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {(job.requirements?.skills || []).length > 6 && (
                                                    <span className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-400">
                                                        +{job.requirements.skills.length - 6}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex w-full gap-3 md:w-auto md:flex-col lg:flex-row">
                                            <button
                                                onClick={() => handleEditClick(job)}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-bold text-slate-200 transition hover:bg-slate-800 md:flex-none"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteJob(job._id)}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-5 py-3 font-bold text-rose-200 transition hover:bg-rose-500/20 md:flex-none"
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

    const renderATS = () => {
        const groupedApplicants = APPLICATION_STATUS_ORDER.reduce((accumulator, status) => {
            accumulator[status] = applicants.filter((application) => normalizeStatus(application.status) === status);
            return accumulator;
        }, {});

        return (
            <div className="space-y-8 animate-fade-in">
                <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 p-6 md:p-8 shadow-2xl shadow-slate-950/40">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-indigo-200">
                                Recruiter Command Center
                            </div>
                            <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">Applicant Tracking Board</h2>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                                Move candidates through the hiring pipeline using the status selector on each card. The board stays in sync with MongoDB via the existing application status endpoint.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 xl:min-w-[520px]">
                            {APPLICATION_STATUS_ORDER.map((status) => (
                                <div key={status} className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{formatStatusLabel(status)}</p>
                                    <p className="mt-1 text-2xl font-black text-white">{groupedApplicants[status].length}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <div className="flex h-fit flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-slate-950/30 lg:max-h-[760px]">
                        <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-6">
                            <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-white">
                                <Briefcase className="h-5 w-5 text-cyan-400" />
                                Active Jobs
                            </h3>
                            <p className="text-xs font-medium text-slate-400">Select a job to view its application board</p>
                        </div>
                        {myJobs.length === 0 ? (
                            <div className="p-6 text-center">
                                <AlertCircle className="mx-auto mb-2 h-10 w-10 text-slate-500" />
                                <p className="font-medium text-slate-300">No job postings yet.</p>
                            </div>
                        ) : (
                            <div className="flex-1 space-y-2 overflow-y-auto p-4">
                                {myJobs.map((job) => (
                                    <button
                                        key={job._id}
                                        onClick={() => handleSelectJob(job)}
                                        className={`w-full rounded-xl border p-4 text-left font-semibold transition-all ${selectedJob?._id === job._id ? 'border-indigo-400/40 bg-indigo-500/10 ring-1 ring-indigo-400/30' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/80'}`}
                                    >
                                        <div className="truncate font-bold text-white">{job.job_title}</div>
                                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                            <Users className="h-3 w-3" />
                                            {job.applicantCount || 0} applicants
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        {selectedJob ? (
                            applicants.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80 p-16 text-center shadow-2xl shadow-slate-950/30">
                                    <div className="mb-4 inline-block rounded-2xl border border-slate-800 bg-slate-900 p-8">
                                        <Users className="h-14 w-14 text-slate-500" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-white">No applicants yet</h3>
                                    <p className="font-medium text-slate-400">Check back soon as candidates apply to this role.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-slate-950/30">
                                    <div className="min-w-[1500px] p-5 md:p-6">
                                        <div className="grid grid-cols-5 gap-4">
                                            {APPLICATION_STATUS_ORDER.map((status) => {
                                                const meta = APPLICATION_STATUS_META[status];
                                                const statusApplicants = groupedApplicants[status];

                                                return (
                                                    <div key={status} className={`flex min-h-[650px] flex-col overflow-hidden rounded-2xl border ${meta.columnClass} shadow-lg`}>
                                                        <div className={`border-b border-white/5 bg-gradient-to-r ${meta.headerClass} px-4 py-4`}>
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div>
                                                                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">{meta.label}</p>
                                                                    <p className="mt-1 text-2xl font-black text-white">{statusApplicants.length}</p>
                                                                </div>
                                                                <div className={`h-3 w-3 rounded-full ${meta.dotClass} shadow-lg`}></div>
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 space-y-3 overflow-y-auto p-3">
                                                            {statusApplicants.length === 0 ? (
                                                                <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 p-6 text-center text-sm text-slate-500">
                                                                    No candidates here yet.
                                                                </div>
                                                            ) : (
                                                                statusApplicants.map((application) => {
                                                                    const missingSkills = formatSkills(application.missing_skills || application.parsed_resume_data?.missing_skills || []);
                                                                    const matchScore = Number(application.ai_match_score || 0);

                                                                    return (
                                                                        <div key={application._id} className="rounded-2xl border border-slate-800 bg-slate-950/95 p-4 shadow-xl shadow-black/10 transition-colors hover:border-slate-700">
                                                                            <div className={`mb-4 h-1.5 w-full rounded-full bg-gradient-to-r ${meta.accentClass}`}></div>

                                                                            <div className="mb-3 flex items-start justify-between gap-3">
                                                                                <div className="min-w-0">
                                                                                    <p className="truncate font-bold leading-5 text-white">{getCandidateName(application)}</p>
                                                                                    <p className="mt-1 truncate text-xs text-slate-500">{application.seeker_id?.email || 'Candidate email unavailable'}</p>
                                                                                </div>
                                                                                <div className={`whitespace-nowrap rounded-xl bg-gradient-to-r px-3 py-2 text-sm font-black ${scoreTone(matchScore)}`}>
                                                                                    {matchScore}%
                                                                                </div>
                                                                            </div>

                                                                            <div className="mb-4 flex items-center justify-between gap-3">
                                                                                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${meta.badgeClass}`}>
                                                                                    <span className={`h-2 w-2 rounded-full ${meta.dotClass}`}></span>
                                                                                    {formatStatusLabel(status)}
                                                                                </span>
                                                                                <button
                                                                                    onClick={() => handleGenerateGuide(application._id)}
                                                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 transition-colors hover:bg-slate-800"
                                                                                >
                                                                                    <BrainCircuit className="h-4 w-4 text-violet-300" />
                                                                                    AI Guide
                                                                                </button>
                                                                            </div>

                                                                            <div className="mb-4">
                                                                                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Update Status</label>
                                                                                <select
                                                                                    value={normalizeStatus(application.status)}
                                                                                    onChange={(event) => updateAppStatus(application._id, event.target.value)}
                                                                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-100 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                                                                                >
                                                                                    {STATUS_OPTIONS.map((option) => (
                                                                                        <option key={option.value} value={option.value}>
                                                                                            {option.label}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                            </div>

                                                                            <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                                                                                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Missing Skills</p>
                                                                                {missingSkills.length > 0 ? (
                                                                                    <div className="flex flex-wrap gap-2">
                                                                                        {missingSkills.slice(0, 4).map((skill) => (
                                                                                            <span key={skill} className="rounded-lg border border-slate-700 bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                                                                                                {skill}
                                                                                            </span>
                                                                                        ))}
                                                                                        {missingSkills.length > 4 && (
                                                                                            <span className="rounded-lg border border-slate-700 bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold text-slate-400">
                                                                                                +{missingSkills.length - 4}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                ) : (
                                                                                    <p className="text-sm font-medium text-emerald-300">No notable gaps detected.</p>
                                                                                )}
                                                                            </div>

                                                                            <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                                                                                <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                                                                                <span className="font-semibold text-slate-400">{application.job_id?.job_title || selectedJob.job_title}</span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80 p-16 text-center shadow-2xl shadow-slate-950/30">
                                <div className="mb-4 inline-block rounded-2xl border border-slate-800 bg-slate-900 p-8">
                                    <Briefcase className="h-14 w-14 text-slate-500" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-white">Select a Job Posting</h3>
                                <p className="font-medium text-slate-400">Choose a job from the left sidebar to view its applicant pipeline.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderAnalytics = () => {
        if (!analytics) {
            return <div className="p-12 text-center text-lg font-medium text-slate-500">Loading analytics...</div>;
        }

        const scoreData = {
            labels: ['Excellent (80%+)', 'Good (60-79%)', 'Average (40-59%)', 'Poor (<40%)'],
            datasets: [{
                label: 'Candidate Volume',
                data: [analytics.scoreDistribution.excellent, analytics.scoreDistribution.good, analytics.scoreDistribution.average, analytics.scoreDistribution.poor],
                backgroundColor: '#6366f1',
                borderRadius: 10,
                borderSkipped: false
            }]
        };

        const funnelData = {
            labels: ['Pending Review', 'Shortlisted', 'Interviewing'],
            datasets: [{
                data: [analytics.funnel.pending, analytics.funnel.shortlisted, analytics.funnel.interviewing],
                backgroundColor: ['#f59e0b', '#6366f1', '#10b981'],
                borderWidth: 0
            }]
        };

        return (
            <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-25 px-8 py-6">
                            <h3 className="mb-1 flex items-center gap-3 text-xl font-bold text-slate-900">
                                <div className="rounded-lg bg-indigo-100 p-2">
                                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                                </div>
                                Candidate Quality Distribution
                            </h3>
                            <p className="text-sm font-medium text-slate-600">AI match score breakdown across all applicants</p>
                        </div>
                        <div className="flex min-h-80 flex-1 items-center justify-center p-8">
                            <div className="w-full">
                                <Bar data={scoreData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50 px-8 py-6">
                            <h3 className="mb-1 flex items-center gap-3 text-xl font-bold text-slate-900">
                                <div className="rounded-lg bg-emerald-100 p-2">
                                    <Users className="h-5 w-5 text-emerald-600" />
                                </div>
                                Hiring Pipeline Funnel
                            </h3>
                            <p className="text-sm font-medium text-slate-600">Candidate progression through hiring stages</p>
                        </div>
                        <div className="flex min-h-80 flex-1 items-center justify-center p-8">
                            <div className="flex w-full justify-center">
                                <Doughnut data={funnelData} options={{ responsive: true, maintainAspectRatio: true }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
                        <div className="mb-4 flex items-start justify-between">
                            <div className="rounded-lg bg-amber-100 p-3">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <span className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold text-amber-600">Pending</span>
                        </div>
                        <p className="mb-1 text-sm font-bold uppercase text-slate-600">Under Review</p>
                        <p className="text-3xl font-black text-slate-900">{analytics?.funnel?.pending || 0}</p>
                    </div>

                    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
                        <div className="mb-4 flex items-start justify-between">
                            <div className="rounded-lg bg-indigo-100 p-3">
                                <Star className="h-5 w-5 text-indigo-600" />
                            </div>
                            <span className="rounded-lg bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-600">Qualified</span>
                        </div>
                        <p className="mb-1 text-sm font-bold uppercase text-slate-600">Shortlisted</p>
                        <p className="text-3xl font-black text-slate-900">{analytics?.funnel?.shortlisted || 0}</p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
                        <div className="mb-4 flex items-start justify-between">
                            <div className="rounded-lg bg-emerald-100 p-3">
                                <Calendar className="h-5 w-5 text-emerald-600" />
                            </div>
                            <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-600">Active</span>
                        </div>
                        <p className="mb-1 text-sm font-bold uppercase text-slate-600">Interviewing</p>
                        <p className="text-3xl font-black text-slate-900">{analytics?.funnel?.interviewing || 0}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-950 md:flex-row">
            <aside className="flex w-full shrink-0 flex-col border-r border-slate-800 bg-slate-950 shadow-sm md:w-64 lg:w-72">
                <div className="border-b border-slate-800 p-6">
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-50">Employer Portal</h2>
                    <p className="mt-1 text-sm font-medium text-cyan-400">AI Talent Acquisition</p>
                </div>
                <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setShowJobForm(false);
                                }}
                                className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                                <span className="flex-1 text-left">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-slate-800 p-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-300 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-200"
                    >
                        <LogOut className="h-5 w-5" />
                        Secure Log Out
                    </button>
                </div>
            </aside>

            <main className="h-full w-full flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.18),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a_52%,_#020617)] p-4 sm:p-6 md:p-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{sidebarItems.find((item) => item.id === activeTab)?.label}</h1>
                    </div>

                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <TrendingUp className="h-8 w-8 animate-bounce text-cyan-400" />
                        </div>
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

            {showGuideModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-fade-in">
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-8 text-white">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                                    <BrainCircuit className="h-7 w-7" />
                                </div>
                                <div>
                                    <h2 className="mb-1 text-2xl font-bold">AI Interview Copilot</h2>
                                    <p className="text-sm font-medium text-purple-100">Skill-gap analysis & personalized interview questions</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowGuideModal(false)}
                                className="rounded-lg p-2 text-white transition-colors hover:bg-white/20"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            {guideLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <BrainCircuit className="mb-4 h-12 w-12 animate-pulse text-purple-400" />
                                    <p className="text-lg font-bold text-slate-600">Analyzing Candidate Profile...</p>
                                    <p className="mt-2 text-sm text-slate-500">Generating personalized interview questions based on skill gaps</p>
                                </div>
                            ) : interviewGuide ? (
                                <div className="space-y-5">
                                    {interviewGuide.questions.map((question, index) => (
                                        <div key={index} className="group rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-25 p-6 transition-all hover:shadow-md">
                                            <div className="mb-4 flex items-start justify-between gap-4">
                                                <span className="whitespace-nowrap rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-purple-700">
                                                    {question.category}
                                                </span>
                                                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">Q{index + 1}</span>
                                            </div>
                                            <p className="mb-4 text-base font-bold leading-relaxed text-slate-900 transition-colors group-hover:text-purple-700">
                                                {question.question}
                                            </p>
                                            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
                                                <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                                                <div>
                                                    <span className="font-bold text-slate-800">Interview Tip:</span>
                                                    <p className="mt-1">{question.intent}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-8 py-4">
                            <button
                                onClick={() => setShowGuideModal(false)}
                                className="rounded-lg bg-slate-200 px-6 py-2.5 font-bold text-slate-700 transition-colors hover:bg-slate-300"
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
