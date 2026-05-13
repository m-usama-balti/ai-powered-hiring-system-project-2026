import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';
import { LogOut } from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    Legend as ReLegend,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';

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

const FALLBACK_ANALYTICS = {
    source: 'mock',
    generated_at: '2026-05-12T09:00:00Z',
    summary: {
        total_users: 1847,
        total_jobs: 312,
        total_applications: 1015,
        active_users_30d: 286,
        recruiter_users: 412,
        seeker_users: 1392,
        admin_users: 43
    },
    applications_per_job_category: [
        { name: 'Software Engineering', applications: 312 },
        { name: 'Data & AI', applications: 184 },
        { name: 'Sales & Marketing', applications: 156 },
        { name: 'Operations', applications: 98 },
        { name: 'Design', applications: 84 },
        { name: 'Finance', applications: 71 },
        { name: 'HR & Talent', applications: 63 },
        { name: 'Security', applications: 47 }
    ],
    platform_user_growth: [
        { month: 'Jun', users: 218 },
        { month: 'Jul', users: 262 },
        { month: 'Aug', users: 311 },
        { month: 'Sep', users: 369 },
        { month: 'Oct', users: 428 },
        { month: 'Nov', users: 486 },
        { month: 'Dec', users: 547 },
        { month: 'Jan', users: 612 },
        { month: 'Feb', users: 694 },
        { month: 'Mar', users: 771 },
        { month: 'Apr', users: 845 },
        { month: 'May', users: 932 }
    ],
    role_distribution: [
        { name: 'Job Seekers', value: 74 },
        { name: 'Recruiters', value: 21 },
        { name: 'Administrators', value: 5 }
    ]
};

const AdminDashboard = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const spamScanEndpoint = 'http://localhost:8000/scan-spam';
    const [activeTab, setActiveTab] = useState('approvals');
    const [pendingJobs, setPendingJobs] = useState([]);
    const [sysStats, setSysStats] = useState(null);
    const [analytics, setAnalytics] = useState(FALLBACK_ANALYTICS);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [spamScores, setSpamScores] = useState({});

    const fetchDashboardData = useCallback(async () => {
        try {
            const [jobsRes, statsRes, analyticsRes] = await Promise.allSettled([
                API.get('/admin/jobs/pending'),
                API.get('/admin/system-stats'),
                API.get('/admin/analytics')
            ]);
            if (jobsRes.status === 'fulfilled') {
                setPendingJobs(jobsRes.value.data);
                await scanPendingJobs(jobsRes.value.data);
            } else {
                setPendingJobs([]);
                setSpamScores({});
            }

            if (statsRes.status === 'fulfilled') {
                setSysStats(statsRes.value.data);
            }

            if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data) {
                setAnalytics(analyticsRes.value.data);
            }
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
            if (action === 'approve') {
                await API.put(`/admin/jobs/${jobId}/approve`);
            } else {
                await API.put(`/admin/jobs/${jobId}/reject`);
            }
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
        { id: 'analytics', label: 'Command Analytics', icon: BarChart3 },
        { id: 'approvals', label: 'Pending Approvals', icon: ShieldAlert },
        { id: 'model', label: 'AI Model Management', icon: BrainCircuit },
        { id: 'system', label: 'System Maintenance', icon: Server }
    ];

    const analyticsData = analytics || FALLBACK_ANALYTICS;
    const categoryData = analyticsData.applications_per_job_category.map((item) => ({ name: item.name, applications: item.applications }));
    const growthData = analyticsData.platform_user_growth.map((item) => ({ month: item.month, users: item.users }));
    const roleData = analyticsData.role_distribution.map((item) => ({ name: item.name, value: item.value }));
    const pieColors = ['#38bdf8', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

    const sharedChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#cbd5e1',
                    usePointStyle: true,
                    padding: 18,
                    boxWidth: 10,
                    font: {
                        family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(2, 6, 23, 0.96)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: '#334155',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 14,
                displayColors: true
            }
        }
    };

    const barOptions = {
        ...sharedChartOptions,
        plugins: {
            ...sharedChartOptions.plugins,
            legend: { display: false }
        },
        scales: {
            x: {
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#94a3b8', precision: 0 },
                grid: { color: 'rgba(148, 163, 184, 0.14)' }
            }
        }
    };

    const lineOptions = {
        ...sharedChartOptions,
        plugins: {
            ...sharedChartOptions.plugins,
            legend: { display: false }
        },
        scales: {
            x: {
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#94a3b8', precision: 0 },
                grid: { color: 'rgba(148, 163, 184, 0.14)' }
            }
        }
    };

    const pieOptions = {
        ...sharedChartOptions,
        plugins: {
            ...sharedChartOptions.plugins,
            legend: {
                position: 'bottom',
                labels: {
                    color: '#cbd5e1',
                    usePointStyle: true,
                    padding: 18,
                    boxWidth: 10,
                    font: {
                        family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace'
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <RefreshCw className="h-10 w-10 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-slate-950 flex flex-col md:flex-row overflow-hidden">
            <aside className="w-full md:w-72 bg-slate-950 border-r border-slate-800 shadow-2xl shadow-slate-950 flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-extrabold text-slate-50 tracking-tight">Admin Console</h2>
                    <p className="text-sm font-medium text-cyan-400 mt-1">AI Platform Governance</p>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                    >
                        <LogOut className="h-5 w-5" />
                        Secure Log Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 h-full w-full overflow-y-auto p-6 md:p-10 bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.18),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a_52%,_#020617)]">
                <div className="mx-auto max-w-7xl">
                    {/* HERO BANNER */}
                    <div className="mb-10 flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-700 p-8 text-white shadow-2xl md:flex-row overflow-hidden relative">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
                        </div>
                        <div className="relative z-10">
                            <div className="mb-2 flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-400/30">
                                    <ShieldAlert className="h-7 w-7 text-cyan-300" />
                                </div>
                                <h1 className="text-4xl font-black tracking-tight">System Admin Console</h1>
                            </div>
                            <p className="font-mono text-sm text-slate-400">Master: {user?.email}</p>
                        </div>
                        <div className="relative z-10 flex items-center gap-4 rounded-xl border border-slate-600 bg-slate-800/60 backdrop-blur-sm px-6 py-3">
                            <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400 animate-pulse"></div>
                            <span className="font-mono text-sm font-bold text-slate-200">SYSTEM ONLINE</span>
                        </div>
                    </div>

                    {activeTab === 'analytics' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                    <div className="absolute -top-10 right-0 h-44 w-44 rounded-full bg-cyan-500 blur-3xl"></div>
                                    <div className="absolute -bottom-10 left-10 h-44 w-44 rounded-full bg-blue-500 blur-3xl"></div>
                                </div>
                                <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                                    <div>
                                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
                                            Live Command Center
                                        </div>
                                        <h2 className="text-3xl font-black text-white md:text-4xl">Administrator Analytics Deck</h2>
                                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                                            Real-time operational intelligence for applications, user growth, and platform roles. Data refreshes from MongoDB, with a premium mock fallback for polished demos.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 xl:min-w-[320px]">
                                        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Data Source</p>
                                            <p className="mt-1 text-sm font-bold text-cyan-300 capitalize">{analyticsData.source}</p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Updated</p>
                                            <p className="mt-1 text-sm font-bold text-white">{new Date(analyticsData.generated_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    {[
                                        { label: 'Total Users', value: analyticsData.summary.total_users, tone: 'cyan' },
                                        { label: 'Applications', value: analyticsData.summary.total_applications, tone: 'emerald' },
                                        { label: 'Jobs Posted', value: analyticsData.summary.total_jobs, tone: 'violet' },
                                        { label: 'Active Users 30d', value: analyticsData.summary.active_users_30d, tone: 'amber' }
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg backdrop-blur-sm">
                                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                                            <div className="mt-3 flex items-end justify-between gap-3">
                                                <p className="text-4xl font-black text-white">{item.value.toLocaleString()}</p>
                                                <span className={`rounded-full border px-2 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${item.tone === 'cyan' ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300' : item.tone === 'emerald' ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : item.tone === 'violet' ? 'border-violet-400/30 bg-violet-500/10 text-violet-300' : 'border-amber-400/30 bg-amber-500/10 text-amber-300'}`}>{item.tone}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-950/15 backdrop-blur-xl">
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-white">Applications per Job Category</h3>
                                            <p className="mt-1 text-sm text-slate-400">Bar chart of application concentration across priority hiring categories.</p>
                                        </div>
                                        <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Bar</span>
                                    </div>
                                    <div className="h-[360px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={categoryData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                                                <CartesianGrid stroke="rgba(148,163,184,0.08)" />
                                                <XAxis dataKey="name" stroke="#94a3b8" />
                                                <YAxis stroke="#94a3b8" />
                                                <ReTooltip wrapperStyle={{ borderRadius: 10, backgroundColor: 'rgba(2,6,23,0.96)' }} />
                                                <Bar dataKey="applications" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-sky-950/15 backdrop-blur-xl">
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-white">Platform User Growth</h3>
                                            <p className="mt-1 text-sm text-slate-400">Cumulative registered users across the last 12 months.</p>
                                        </div>
                                        <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-sky-300">Line</span>
                                    </div>
                                    <div className="h-[360px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={growthData} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
                                                <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="3 3" />
                                                <XAxis dataKey="month" stroke="#94a3b8" />
                                                <YAxis stroke="#94a3b8" />
                                                <ReTooltip wrapperStyle={{ borderRadius: 10, backgroundColor: 'rgba(2,6,23,0.96)' }} />
                                                <Line type="monotone" dataKey="users" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-violet-950/15 backdrop-blur-xl">
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-white">User Role Distribution</h3>
                                            <p className="mt-1 text-sm text-slate-400">Composition of seeker, recruiter, and administrator accounts.</p>
                                        </div>
                                        <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-violet-300">Pie</span>
                                    </div>
                                    <div className="h-[340px] w-full md:h-[380px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={roleData} cx="50%" cy="45%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name" paddingAngle={6}>
                                                    {roleData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                                    ))}
                                                </Pie>
                                                <ReLegend verticalAlign="bottom" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black text-white">Operational Notes</h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            The endpoint automatically aggregates MongoDB data and falls back to polished demo series when the database is sparse, so your defense environment always looks fully instrumented.
                                        </p>
                                    </div>

                                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        {[
                                            { label: 'Seekers', value: analyticsData.summary.seeker_users },
                                            { label: 'Recruiters', value: analyticsData.summary.recruiter_users },
                                            { label: 'Admins', value: analyticsData.summary.admin_users }
                                        ].map((item) => (
                                            <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
                                                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                                                <p className="mt-2 text-2xl font-black text-white">{item.value.toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                <h2 className="text-3xl font-black text-white">Pending Approvals ({pendingJobs.length})</h2>
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
