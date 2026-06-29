import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';

const SearchIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const BriefcaseIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 12h18" />
    </svg>
);

const MapPinIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M12 21s6-5.4 6-11a6 6 0 0 0-12 0c0 5.6 6 11 6 11z" />
        <circle cx="12" cy="10" r="2" />
    </svg>
);

const ClockIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </svg>
);

const FilterIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M4 6h16" />
        <path d="M7 12h10" />
        <path d="M10 18h4" />
    </svg>
);

const AlertCircleIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
    </svg>
);

const CheckCircle2Icon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const FindJobs = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applyingTo, setApplyingTo] = useState(null);
    const [applicationResults, setApplicationResults] = useState({});
    const [filters, setFilters] = useState({
        keyword: '',
        location: '',
        experience: 'all'
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await API.get('/jobs');
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.user_type !== 'job_seeker') {
            alert('Only Job Seekers can apply for jobs.');
            return;
        }

        setApplyingTo(jobId);
        try {
            const response = await API.post(`/applications/${jobId}`);
            setApplicationResults((prev) => ({
                ...prev,
                [jobId]: { success: true, score: response.data.match_score }
            }));
        } catch (error) {
            setApplicationResults((prev) => ({
                ...prev,
                [jobId]: { success: false, message: error.response?.data?.message || 'Application failed.' }
            }));
        } finally {
            setApplyingTo(null);
        }
    };

    const filteredJobs = jobs.filter((job) => {
        const keyword = filters.keyword.toLowerCase();
        const location = filters.location.toLowerCase();
        const matchesKeyword = (job.job_title?.toLowerCase().includes(keyword) || job.description?.toLowerCase().includes(keyword));
        const matchesLocation = job.location?.toLowerCase().includes(location);

        let matchesExp = true;
        const requiredYears = job.requirements?.experience_years || 0;
        if (filters.experience === 'entry') matchesExp = requiredYears <= 2;
        if (filters.experience === 'mid') matchesExp = requiredYears >= 3 && requiredYears <= 5;
        if (filters.experience === 'senior') matchesExp = requiredYears > 5;

        return matchesKeyword && matchesLocation && matchesExp;
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 pb-20 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="mx-auto max-w-6xl relative z-10">
                {/* Header */}
                <div className="mb-12 text-center space-y-3 animate-fade-in">
                    <h1 className="text-5xl lg:text-6xl font-black leading-tight">
                        <span className="text-white block mb-2">Find Your Perfect</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-blue-400">
                            AI Match
                        </span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-slate-300 leading-relaxed">
                        Browse active positions. When you apply, our NLP algorithm instantly scores your resume against the employer's requirements.
                    </p>
                </div>

                {/* Search Filters */}
                <div className="mb-10 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-6 shadow-xl">
                    <div className="mb-6 flex items-center gap-3 font-bold text-slate-100">
                        <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 6h16M7 12h10M10 18h4" />
                        </svg>
                        <h2>Advanced Search Filters</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Keyword Search */}
                        <div className="group">
                            <div className="flex items-center rounded-xl border border-slate-700/50 bg-slate-700/20 px-4 py-3 hover:bg-slate-700/30 hover:border-slate-600/50 transition-smooth focus-within:border-indigo-500/50 focus-within:bg-slate-700/40">
                                <svg className="mr-3 h-5 w-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Job title or keyword..."
                                    className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 outline-none font-medium"
                                    value={filters.keyword}
                                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Location Filter */}
                        <div className="group">
                            <div className="flex items-center rounded-xl border border-slate-700/50 bg-slate-700/20 px-4 py-3 hover:bg-slate-700/30 hover:border-slate-600/50 transition-smooth focus-within:border-emerald-500/50 focus-within:bg-slate-700/40">
                                <svg className="mr-3 h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 21s6-5.4 6-11a6 6 0 0 0-12 0c0 5.6 6 11 6 11z" />
                                    <circle cx="12" cy="10" r="2" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="City or Remote..."
                                    className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 outline-none font-medium"
                                    value={filters.location}
                                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Experience Level */}
                        <div className="group">
                            <div className="flex items-center rounded-xl border border-slate-700/50 bg-slate-700/20 px-4 py-3 hover:bg-slate-700/30 hover:border-slate-600/50 transition-smooth focus-within:border-blue-500/50 focus-within:bg-slate-700/40">
                                <svg className="mr-3 h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
                                    <rect x="3" y="6" width="18" height="14" rx="2" />
                                    <path d="M3 12h18" />
                                </svg>
                                <select
                                    className="w-full bg-transparent text-sm text-slate-100 outline-none focus:ring-0 cursor-pointer font-medium appearance-none"
                                    value={filters.experience}
                                    onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                                >
                                    <option value="all" className="bg-slate-800 text-slate-100">Any Experience Level</option>
                                    <option value="entry" className="bg-slate-800 text-slate-100">Entry Level (0-2 years)</option>
                                    <option value="mid" className="bg-slate-800 text-slate-100">Mid Level (3-5 years)</option>
                                    <option value="senior" className="bg-slate-800 text-slate-100">Senior Level (6+ years)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="py-20 text-center font-medium text-slate-400 animate-pulse">
                        <div className="inline-block mb-4 w-8 h-8 border-2 border-indigo-500 border-t-indigo-300 rounded-full animate-spin"></div>
                        <div>Loading active jobs from the database...</div>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-12 text-center">
                        <svg className="mx-auto mb-4 h-12 w-12 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4" />
                            <path d="M12 16h.01" />
                        </svg>
                        <h3 className="mb-2 text-lg font-bold text-slate-100">No jobs found</h3>
                        <p className="text-slate-400">Try adjusting your filters or search keywords.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-sm font-semibold text-slate-400">
                            Showing <span className="text-indigo-400">{filteredJobs.length}</span> active job(s)
                        </div>

                        {filteredJobs.map((job, idx) => (
                            <div
                                key={job._id}
                                className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-6 md:p-8 hover:border-indigo-500/50 transition-smooth hover:shadow-xl hover:shadow-indigo-500/20 animate-fade-in"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-emerald-500/0 group-hover:from-indigo-500/5 group-hover:via-transparent group-hover:to-emerald-500/5 transition-all duration-500"></div>

                                {job.status !== 'active' && (
                                    <div className="absolute right-6 top-6 rounded-full bg-red-500/20 border border-red-500/50 px-3 py-1 text-xs font-bold text-red-300 z-10">
                                        Closed
                                    </div>
                                )}

                                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                                    <div className="flex-1 space-y-3">
                                        <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-emerald-400 transition-all">
                                            {job.job_title}
                                        </h3>

                                        <div className="flex flex-wrap gap-4 text-sm text-slate-300 font-medium">
                                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/30">
                                                <svg className="h-4 w-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
                                                    <rect x="3" y="6" width="18" height="14" rx="2" />
                                                    <path d="M3 12h18" />
                                                </svg>
                                                {job.recruiter_id?.company?.company_name || 'Hiring Company'}
                                            </span>
                                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/30">
                                                <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 21s6-5.4 6-11a6 6 0 0 0-12 0c0 5.6 6 11 6 11z" />
                                                    <circle cx="12" cy="10" r="2" />
                                                </svg>
                                                {job.location || 'Remote'}
                                            </span>
                                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/30">
                                                <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <path d="M12 6v6l4 2" />
                                                </svg>
                                                {job.requirements?.experience_years || 0}+ Yrs
                                            </span>
                                        </div>

                                        <p className="line-clamp-2 md:line-clamp-3 text-sm text-slate-300 leading-relaxed">
                                            {job.description}
                                        </p>

                                        <div className="pt-2">
                                            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Required Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {job.requirements?.skills?.map((skill, sidx) => (
                                                    <span
                                                        key={sidx}
                                                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 transition-all"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-stretch md:items-end md:justify-center w-full md:w-auto gap-3 pt-4 md:pt-0 md:pl-6 border-t border-slate-700/50 md:border-t-0 md:border-l md:min-w-48">
                                        {applicationResults[job._id] ? (
                                            applicationResults[job._id].success ? (
                                                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-2">
                                                    <svg className="mx-auto h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <path d="m9 12 2 2 4-4" />
                                                    </svg>
                                                    <div className="text-sm font-bold text-emerald-300">Application Sent!</div>
                                                    <div className="text-2xl font-black text-emerald-400">{applicationResults[job._id].score}% Match</div>
                                                </div>
                                            ) : (
                                                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm font-bold text-red-400">
                                                    {applicationResults[job._id].message}
                                                </div>
                                            )
                                        ) : (
                                            <button
                                                onClick={() => handleApply(job._id)}
                                                disabled={applyingTo === job._id || job.status !== 'active'}
                                                className={`w-full px-6 py-3 rounded-xl font-bold transition-smooth ${job.status !== 'active'
                                                        ? 'bg-slate-700/30 text-slate-400 cursor-not-allowed'
                                                        : applyingTo === job._id
                                                            ? 'bg-indigo-600/60 text-indigo-200 cursor-wait'
                                                            : !user
                                                                ? 'bg-slate-700/30 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/20'
                                                                : 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5'
                                                    }`}
                                            >
                                                {job.status !== 'active'
                                                    ? 'Position Closed'
                                                    : applyingTo === job._id
                                                        ? 'AI Processing...'
                                                        : !user
                                                            ? 'Sign in to Apply'
                                                            : 'Apply Now (1-Click)'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindJobs;
