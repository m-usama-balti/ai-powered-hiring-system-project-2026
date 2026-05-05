import { useState, useEffect, useContext } from 'react';
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

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [jobsRes, statsRes] = await Promise.all([
                API.get('/admin/jobs/pending'),
                API.get('/admin/system-stats')
            ]);
            setPendingJobs(jobsRes.data);
            setSysStats(statsRes.data);
            await scanPendingJobs(jobsRes.data);
        } catch (error) {
            console.error('Error fetching admin data');
        } finally {
            setLoading(false);
        }
    };

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
        } catch (error) {
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

            <main className="flex-1 h-full w-full overflow-y-auto p-6 md:p-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col items-center justify-between gap-6 rounded-2xl bg-slate-900 p-8 text-white shadow-xl md:flex-row">
                        <div>
                            <div className="mb-2 flex items-center gap-3">
                                <ShieldAlert className="h-8 w-8 text-indigo-400" />
                                <h1 className="text-3xl font-black tracking-tight">System Admin Console</h1>
                            </div>
                            <p className="font-mono text-sm text-slate-400">Authenticated as Master Developer: {user?.email}</p>
                        </div>
                        <div className="flex items-center gap-4 rounded-lg border border-slate-700 bg-slate-800 px-6 py-3">
                            <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-500"></div>
                            <span className="font-mono text-sm font-bold text-slate-300">SYSTEM ONLINE</span>
                        </div>
                    </div>

                    {activeTab === 'approvals' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-900">Pending Requisitions ({pendingJobs.length})</h2>
                            </div>

                            {pendingJobs.length === 0 ? (
                                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                                    <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-400" />
                                    <h3 className="text-xl font-bold text-slate-800">All Caught Up</h3>
                                    <p className="text-slate-500">No pending jobs require developer review.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {pendingJobs.map((job) => {
                                        const spamResult = spamScores[job._id];
                                        const spamProbability = spamResult?.spam_probability;
                                        const fraudScore = typeof spamProbability === 'number' ? Math.round(spamProbability * 100) : null;
                                        const isSuspicious = spamResult ? !spamResult.is_safe : false;
                                        const scanLabel = typeof fraudScore === 'number' ? `${fraudScore}% Spam/Fake Probability` : 'AI scan pending';
                                        const scanMessage = spamResult
                                            ? (isSuspicious
                                                ? 'Flagged by NLP classifier: suspicious wording detected. Manual verification required.'
                                                : 'Passed NLP safety classification checks.')
                                            : 'Waiting for the NLP classifier to return a probability.';

                                        return (
                                            <div key={job._id} className="flex flex-col gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row">
                                                <div className="grow">
                                                    <div className="mb-2 flex items-center gap-3">
                                                        <h3 className="text-xl font-bold text-slate-900">{job.job_title}</h3>
                                                        <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-500">ID: {job._id.substring(0, 8)}</span>
                                                    </div>
                                                    <p className="mb-4 text-sm font-semibold text-indigo-600">{job.recruiter_id?.company?.company_name || `Recruiter: ${job.recruiter_id?.email}`}</p>
                                                    <p className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600 line-clamp-2">{job.description}</p>

                                                    <div className={`flex items-start gap-3 rounded-lg border p-3 ${isSuspicious ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                                                        {isSuspicious ? <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" /> : <ShieldAlert className="mt-0.5 h-5 w-5 text-emerald-500" />}
                                                        <div>
                                                            <p className={`text-sm font-bold ${isSuspicious ? 'text-red-800' : 'text-emerald-800'}`}>AI Safety Scan: {scanLabel}</p>
                                                            <p className={`mt-1 text-xs ${isSuspicious ? 'text-red-600' : 'text-emerald-600'}`}>{scanMessage}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex min-w-37.5 flex-col justify-center gap-3 border-t border-slate-200 pt-6 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                                                    <button onClick={() => handleJobReview(job._id, 'approve')} disabled={actionLoading === job._id} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 font-bold text-white transition-colors hover:bg-emerald-700">
                                                        <CheckCircle2 className="h-5 w-5" /> Approve
                                                    </button>
                                                    <button onClick={() => handleJobReview(job._id, 'reject')} disabled={actionLoading === job._id} className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-100 py-2.5 font-bold text-red-700 transition-colors hover:bg-red-200">
                                                        <XCircle className="h-5 w-5" /> Reject
                                                    </button>
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
                                <div className="space-y-6">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-500">Active Parsing Engine</label>
                                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono font-semibold text-slate-800">
                                            <span>{sysStats?.ai_model.active_version}</span>
                                            <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-1 text-xs text-emerald-800">ACTIVE</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-500">Model Confidence Accuracy</label>
                                        <div className="flex items-center gap-4">
                                            <div className="h-4 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                                                <div className="h-4 rounded-full bg-indigo-600" style={{ width: `${sysStats?.ai_model.accuracy_rate}%` }}></div>
                                            </div>
                                            <span className="font-black text-indigo-600">{sysStats?.ai_model.accuracy_rate}%</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-200 pt-6">
                                        <button onClick={() => alert('Initiating Scikit-Learn retraining sequence...')} className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 font-bold text-white transition-colors hover:bg-slate-800">
                                            <RefreshCw className="h-5 w-5" /> Force Model Retraining
                                        </button>
                                        <p className="mt-3 text-center font-mono text-xs text-slate-500">Last trained: {new Date(sysStats?.ai_model.last_trained).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                                <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-slate-900">
                                    <BarChart3 className="text-indigo-600" /> Analytics & Throughput
                                </h2>
                                <div className="mb-6 grid grid-cols-2 gap-4">
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-xs font-bold uppercase text-slate-500">Total Resumes Parsed</p>
                                        <p className="mt-1 text-3xl font-black text-slate-900">{sysStats?.metrics.resumes_parsed}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-xs font-bold uppercase text-slate-500">Match Calculations</p>
                                        <p className="mt-1 text-3xl font-black text-slate-900">4,892</p>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                                    <h4 className="mb-2 text-sm font-bold text-indigo-900">Algorithm Weights (Current)</h4>
                                    <ul className="space-y-2 font-mono text-sm text-indigo-800">
                                        <li className="flex justify-between"><span>TF-IDF Skill Vector:</span> <span>70%</span></li>
                                        <li className="flex justify-between"><span>Experience Ratio:</span> <span>30%</span></li>
                                    </ul>
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
