import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';
import { LogOut } from 'lucide-react';

const ShieldAlert = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 11h6" />
        <path d="M12 8v6" />
    </svg>
);

const Activity = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M22 12h-4l-3 9-4-18-3 9H2" />
    </svg>
);

const BrainCircuit = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M9 3a4 4 0 0 0-4 4v1a3 3 0 0 0-1 5 3 3 0 0 0 1 5v1a4 4 0 0 0 4 4" />
        <path d="M15 3a4 4 0 0 1 4 4v1a3 3 0 0 1 1 5 3 3 0 0 1-1 5v1a4 4 0 0 1-4 4" />
        <path d="M12 4v16" />
        <circle cx="8" cy="8" r="1" />
        <circle cx="16" cy="8" r="1" />
        <circle cx="8" cy="16" r="1" />
        <circle cx="16" cy="16" r="1" />
    </svg>
);

const Server = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <rect x="3" y="4" width="18" height="6" rx="2" />
        <rect x="3" y="14" width="18" height="6" rx="2" />
        <path d="M7 7h.01" />
        <path d="M7 17h.01" />
    </svg>
);

const CheckCircle2 = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const XCircle = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
    </svg>
);

const RefreshCw = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M21 12a9 9 0 0 0-15-6.7L3 7" />
        <path d="M3 3v4h4" />
        <path d="M3 12a9 9 0 0 0 15 6.7L21 17" />
        <path d="M21 21v-4h-4" />
    </svg>
);

const BarChart3 = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="M8 17V9" />
        <path d="M13 17V5" />
        <path d="M18 17v-7" />
    </svg>
);

const AlertTriangle = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3l-8.47-14.14a2 2 0 0 0-3.42 0z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </svg>
);

const AdminDashboard = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const spamScanEndpoint = 'http://localhost:8000/scan-spam';
    const [activeTab, setActiveTab] = useState('approvals');
    const [pendingJobs, setPendingJobs] = useState([]);
    const [sysStats, setSysStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [spamScores, setSpamScores] = useState({});

    const fetchDashboardData = useCallback(async () => {
        try {
            const [jobsRes, statsRes] = await Promise.all([
                API.get('/admin/jobs/pending'),
                API.get('/admin/system-stats')
            ]);
            setPendingJobs(jobsRes.data);
            setSysStats(statsRes.data);
            await scanPendingJobs(jobsRes.data);
        } catch {
            console.error('Error fetching admin data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const scanPendingJobs = async (jobs) => {
        if (!Array.isArray(jobs) || jobs.length === 0) {
            setSpamScores({});
            return;
        }

        const scans = await Promise.allSettled(
            jobs.map(async (job) => {
                const response = await fetch(spamScanEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ job_description: job.description || '' })
                });

                if (!response.ok) {
                    throw new Error('Spam scan request failed');
                }

                const data = await response.json();
                return [job._id, data];
            })
        );

        const scoreMap = {};
        for (const result of scans) {
            if (result.status === 'fulfilled') {
                const [jobId, data] = result.value;
                scoreMap[jobId] = data;
            }
        }

        setSpamScores(scoreMap);
    };

    const handleJobReview = async (jobId, action) => {
        setActionLoading(jobId);
        try {
            await API.put(`/admin/jobs/${jobId}/review`, { action });
            setPendingJobs(pendingJobs.filter((j) => j._id !== jobId));
        } catch {
            alert('Error reviewing job');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        if (setUser) setUser(null);
        navigate('/login');
    };

    const sidebarItems = [
        { id: 'approvals', label: 'Job Approvals', icon: ShieldAlert },
        { id: 'model', label: 'AI Model Management', icon: BrainCircuit },
        { id: 'system', label: 'System Maintenance', icon: Server }
    ];

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <RefreshCw className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            <aside className="w-full md:w-72 bg-white border-r border-slate-200 shadow-sm flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin Console</h2>
                    <p className="text-sm font-medium text-indigo-600 mt-1">AI Platform Governance</p>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`} />
                                {item.label}
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

            <main className="flex-1 h-full w-full overflow-y-auto p-6 md:p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="mx-auto max-w-7xl">
                    {/* HERO BANNER */}
                    <div className="mb-10 flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 p-8 text-white shadow-2xl md:flex-row overflow-hidden relative">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
                        </div>
                        <div className="relative z-10">
                            <div className="mb-2 flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-indigo-500 bg-opacity-20 border border-indigo-400">
                                    <ShieldAlert className="h-7 w-7 text-indigo-300" />
                                </div>
                                <h1 className="text-4xl font-black tracking-tight">System Admin Console</h1>
                            </div>
                            <p className="font-mono text-sm text-slate-400">Master: {user?.email}</p>
                        </div>
                        <div className="relative z-10 flex items-center gap-4 rounded-xl border border-slate-600 bg-slate-700 bg-opacity-50 backdrop-blur-sm px-6 py-3">
                            <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400 animate-pulse"></div>
                            <span className="font-mono text-sm font-bold text-slate-200">SYSTEM ONLINE</span>
                        </div>
                    </div>

                    {/* SYSTEM METRICS - Premium Cards */}
                    {activeTab === 'approvals' && (
                        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-slate-800 to-slate-750 border border-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-indigo-500 bg-opacity-20 p-3 rounded-lg border border-indigo-500 border-opacity-30">
                                        <ShieldAlert className="h-6 w-6 text-indigo-300" />
                                    </div>
                                    <span className="text-xs font-bold text-indigo-300 bg-indigo-500 bg-opacity-20 px-2 py-1 rounded-lg">Pending</span>
                                </div>
                                <p className="text-slate-400 font-mono text-xs uppercase mb-2">Jobs Awaiting Review</p>
                                <h3 className="text-4xl font-black text-slate-100">{pendingJobs.length}</h3>
                            </div>

                            <div className="bg-gradient-to-br from-slate-800 to-slate-750 border border-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-lg border border-emerald-500 border-opacity-30">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-300" />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-300 bg-emerald-500 bg-opacity-20 px-2 py-1 rounded-lg">Approved</span>
                                </div>
                                <p className="text-slate-400 font-mono text-xs uppercase mb-2">Total Approved</p>
                                <h3 className="text-4xl font-black text-slate-100">{sysStats?.approved_jobs || 0}</h3>
                            </div>

                            <div className="bg-gradient-to-br from-slate-800 to-slate-750 border border-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 border-opacity-30">
                                        <AlertTriangle className="h-6 w-6 text-red-300" />
                                    </div>
                                    <span className="text-xs font-bold text-red-300 bg-red-500 bg-opacity-20 px-2 py-1 rounded-lg">Flagged</span>
                                </div>
                                <p className="text-slate-400 font-mono text-xs uppercase mb-2">Spam Flagged</p>
                                <h3 className="text-4xl font-black text-slate-100">
                                    {Object.values(spamScores).filter(s => !s.is_safe).length}
                                </h3>
                            </div>
                        </div>
                    )}

                    {activeTab === 'approvals' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <ShieldAlert className="h-6 w-6 text-indigo-400" />
                                <h2 className="text-3xl font-black text-white">Pending Requisitions ({pendingJobs.length})</h2>
                            </div>

                            {pendingJobs.length === 0 ? (
                                <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-750 p-16 text-center shadow-lg">
                                    <div className="bg-emerald-500 bg-opacity-20 p-4 rounded-xl inline-block mb-4 border border-emerald-500 border-opacity-30">
                                        <CheckCircle2 className="h-12 w-12 text-emerald-300 mx-auto" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-100 mb-2">All Caught Up</h3>
                                    <p className="text-slate-400 font-medium">No pending jobs require review at this time.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {pendingJobs.map((job) => {
                                        const spamResult = spamScores[job._id];
                                        const spamProbability = spamResult?.spam_probability;
                                        const fraudScore = typeof spamProbability === 'number' ? Math.round(spamProbability * 100) : null;
                                        const isSuspicious = spamResult ? !spamResult.is_safe : false;
                                        const scanLabel = typeof fraudScore === 'number' ? `${fraudScore}% Risk` : 'Scanning...';

                                        return (
                                            <div key={job._id} className="group rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-750 shadow-lg hover:shadow-2xl hover:border-slate-600 transition-all overflow-hidden">
                                                <div className="flex flex-col md:flex-row">
                                                    {/* Left Content */}
                                                    <div className="flex-1 p-8">
                                                        <div className="mb-4 flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <h3 className="text-2xl font-bold text-slate-100 group-hover:text-indigo-300 transition-colors mb-2">{job.job_title}</h3>
                                                                <p className="text-sm font-semibold text-indigo-400 mb-3">{job.recruiter_id?.company?.company_name || `Recruiter: ${job.recruiter_id?.email}`}</p>
                                                            </div>
                                                            <span className="rounded-lg bg-slate-700 px-3 py-1.5 font-mono text-xs text-slate-400 whitespace-nowrap">ID: {job._id.substring(0, 8)}</span>
                                                        </div>

                                                        <p className="mb-6 rounded-lg border border-slate-700 bg-slate-700 bg-opacity-40 p-4 text-sm text-slate-300 line-clamp-2 font-medium">{job.description}</p>

                                                        {/* AI SAFETY SCAN - HIGHLIGHTED */}
                                                        <div className={`flex items-start gap-4 rounded-xl border p-4 backdrop-blur-sm transition-all ${isSuspicious
                                                            ? 'border-red-500 border-opacity-50 bg-red-500 bg-opacity-10'
                                                            : 'border-emerald-500 border-opacity-50 bg-emerald-500 bg-opacity-10'
                                                            }`}>
                                                            <div className="flex-shrink-0">
                                                                {isSuspicious ? (
                                                                    <div className="relative">
                                                                        <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
                                                                        <div className="absolute inset-0 h-6 w-6 bg-red-400 opacity-10 rounded-lg animate-pulse"></div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="relative">
                                                                        <ShieldAlert className="h-6 w-6 text-emerald-400" />
                                                                        <div className="absolute inset-0 h-6 w-6 bg-emerald-400 opacity-10 rounded-lg"></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className={`text-sm font-black uppercase tracking-wider ${isSuspicious ? 'text-red-300' : 'text-emerald-300'}`}>
                                                                        AI Safety Scan
                                                                    </p>
                                                                    <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${isSuspicious
                                                                        ? 'bg-red-500 bg-opacity-30 border border-red-400 border-opacity-50 text-red-200'
                                                                        : 'bg-emerald-500 bg-opacity-30 border border-emerald-400 border-opacity-50 text-emerald-200'
                                                                        }`}>
                                                                        {scanLabel}
                                                                    </div>
                                                                </div>
                                                                <p className={`text-xs font-medium ${isSuspicious ? 'text-red-300' : 'text-emerald-300'}`}>
                                                                    {spamResult ? (
                                                                        isSuspicious
                                                                            ? 'NLP flagged: suspicious content detected. Manual review strongly recommended.'
                                                                            : 'NLP verified: content passed safety classification.'
                                                                    ) : (
                                                                        'Running FastAPI spam classifier...'
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Actions */}
                                                    <div className="flex md:flex-col gap-3 p-6 md:p-8 border-t md:border-t-0 md:border-l border-slate-700 justify-center">
                                                        <button
                                                            onClick={() => handleJobReview(job._id, 'approve')}
                                                            disabled={actionLoading === job._id}
                                                            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 font-bold text-white hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {actionLoading === job._id ? (
                                                                <div className="w-5 h-5 border-2 border-white border-r-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 className="h-5 w-5" />
                                                            )}
                                                            <span>Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleJobReview(job._id, 'reject')}
                                                            disabled={actionLoading === job._id}
                                                            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 font-bold text-white hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {actionLoading === job._id ? (
                                                                <div className="w-5 h-5 border-2 border-white border-r-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <XCircle className="h-5 w-5" />
                                                            )}
                                                            <span>Reject</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'model' && (
                        <div className="grid grid-cols-1 gap-8 animate-fade-in lg:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                                <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-slate-900">
                                    <BrainCircuit className="text-indigo-600" /> NLP Pipeline Config
                                </h2>
                                <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 px-8 py-6 border-b border-slate-700">
                                    <h2 className="flex items-center gap-3 text-2xl font-bold text-indigo-100 mb-1">
                                        <BrainCircuit className="h-6 w-6 text-indigo-300" />
                                        NLP Pipeline Config
                                    </h2>
                                    <p className="text-indigo-300 font-mono text-sm">Scikit-Learn TF-IDF + Naive Bayes</p>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div>
                                        <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-400">Active Parsing Engine</label>
                                        <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700 bg-opacity-50 p-4 font-mono font-semibold text-slate-200 backdrop-blur-sm">
                                            <span>{sysStats?.ai_model.active_version}</span>
                                            <span className="rounded-full border border-emerald-400 border-opacity-50 bg-emerald-500 bg-opacity-20 px-3 py-1 text-xs font-black text-emerald-200">ACTIVE</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-400">Model Confidence Accuracy</label>
                                        <div className="flex items-center gap-4">
                                            <div className="h-2 flex-1 overflow-hidden rounded-full border border-slate-600 bg-slate-700">
                                                <div
                                                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/50"
                                                    style={{ width: `${sysStats?.ai_model.accuracy_rate}%` }}
                                                ></div>
                                            </div>
                                            <span className="font-black text-indigo-300 min-w-12">{sysStats?.ai_model.accuracy_rate}%</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2 font-mono">Last trained: {new Date(sysStats?.ai_model.last_trained).toLocaleDateString()}</p>
                                    </div>
                                    <div className="border-t border-slate-700 pt-6">
                                        <button
                                            onClick={() => alert('Initiating Scikit-Learn retraining sequence...')}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 py-3.5 font-bold text-slate-100 hover:from-slate-600 hover:to-slate-500 transition-all shadow-lg"
                                        >
                                            <RefreshCw className="h-5 w-5" />
                                            Force Model Retraining
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                                <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-slate-900">
                                    <BarChart3 className="text-indigo-600" /> Analytics & Throughput
                                </h2>
                                <div className="bg-gradient-to-r from-purple-900 to-purple-800 px-8 py-6 border-b border-slate-700">
                                    <h2 className="flex items-center gap-3 text-2xl font-bold text-purple-100 mb-1">
                                        <BarChart3 className="h-6 w-6 text-purple-300" />
                                        AI Processing Analytics
                                    </h2>
                                    <p className="text-purple-300 font-mono text-sm">System throughput & algorithm weights</p>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-lg border border-slate-600 bg-slate-700 bg-opacity-50 p-4 backdrop-blur-sm">
                                            <p className="text-xs font-bold uppercase text-slate-400 tracking-wide mb-2">Resumes Parsed</p>
                                            <p className="text-3xl font-black text-slate-100">{sysStats?.metrics.resumes_parsed}</p>
                                        </div>
                                        <div className="rounded-lg border border-slate-600 bg-slate-700 bg-opacity-50 p-4 backdrop-blur-sm">
                                            <p className="text-xs font-bold uppercase text-slate-400 tracking-wide mb-2">Matches Calculated</p>
                                            <p className="text-3xl font-black text-slate-100">4,892</p>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-purple-500 border-opacity-40 bg-purple-500 bg-opacity-10 p-5 backdrop-blur-sm">
                                        <h4 className="mb-4 text-sm font-bold text-purple-200 uppercase tracking-wider">Algorithm Weights (Current)</h4>
                                        <ul className="space-y-3">
                                            <li className="flex items-center justify-between font-mono text-sm">
                                                <span className="text-slate-300">TF-IDF Skill Vector</span>
                                                <span className="font-black text-purple-300">70%</span>
                                            </li>
                                            <li className="flex items-center justify-between font-mono text-sm">
                                                <span className="text-slate-300">Experience Ratio</span>
                                                <span className="font-black text-purple-300">30%</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-slate-900">
                                <Activity className="text-indigo-600" /> Microservice Telemetry
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-mono text-sm">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-600">
                                            <th className="rounded-tl-lg p-4 font-bold">Service Node</th>
                                            <th className="p-4 font-bold">Protocol</th>
                                            <th className="p-4 font-bold">Status</th>
                                            <th className="rounded-tr-lg p-4 font-bold">Latency</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-slate-100">
                                            <td className="p-4 font-bold text-slate-900">MongoDB Database</td>
                                            <td className="p-4 text-slate-500">mongodb+srv://</td>
                                            <td className="p-4"><span className="rounded px-2 py-1 font-bold text-emerald-600 bg-emerald-50">{sysStats?.servers.database.status}</span></td>
                                            <td className="p-4 text-slate-600">{sysStats?.servers.database.latency}</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="p-4 font-bold text-slate-900">Node.js API (Backend)</td>
                                            <td className="p-4 text-slate-500">http://localhost:5000</td>
                                            <td className="p-4"><span className="rounded px-2 py-1 font-bold text-emerald-600 bg-emerald-50">{sysStats?.servers.node_api.status}</span></td>
                                            <td className="p-4 text-slate-600">{sysStats?.servers.node_api.latency}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 font-bold text-slate-900">Python FastAPI (AI Engine)</td>
                                            <td className="p-4 text-slate-500"><a href="http://127.0.0.1:8000" className="hover:text-indigo-600">http://127.0.0.1:8000</a></td>
                                            <td className="p-4"><span className="rounded px-2 py-1 font-bold text-emerald-600 bg-emerald-50">{sysStats?.servers.python_ai.status}</span></td>
                                            <td className="p-4 text-slate-600">{sysStats?.servers.python_ai.latency}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-8 flex justify-end border-t border-slate-200 pt-6">
                                <button className="rounded-lg border border-slate-300 bg-slate-100 px-6 py-2 font-bold text-slate-700 transition-colors hover:bg-slate-200">
                                    Download Server Logs (.csv)
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
