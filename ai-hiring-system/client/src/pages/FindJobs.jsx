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
        <div className="min-h-screen bg-slate-50 px-4 pb-20 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-10 text-center">
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900">
                        Find Your Perfect <span className="text-indigo-600">AI Match</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-slate-600">
                        Browse active positions. When you apply, our NLP algorithm instantly scores your resume against the employer&apos;s requirements.
                    </p>
                </div>

                <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 font-bold text-slate-800">
                        <FilterIcon className="h-5 w-5 text-indigo-600" />
                        <h2>Advanced Search Filters</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <SearchIcon className="mr-2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Job title or keyword..."
                                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none focus:ring-0"
                                value={filters.keyword}
                                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <MapPinIcon className="mr-2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="City or Remote..."
                                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none focus:ring-0"
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <BriefcaseIcon className="mr-2 h-5 w-5 text-slate-400" />
                            <select
                                className="w-full cursor-pointer border-none bg-transparent text-sm text-slate-700 outline-none focus:ring-0"
                                value={filters.experience}
                                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                            >
                                <option value="all">Any Experience Level</option>
                                <option value="entry">Entry Level (0-2 years)</option>
                                <option value="mid">Mid Level (3-5 years)</option>
                                <option value="senior">Senior Level (6+ years)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center font-medium text-slate-500 animate-pulse">
                        Loading active jobs from the database...
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <AlertCircleIcon className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                        <h3 className="mb-2 text-lg font-bold text-slate-900">No jobs found</h3>
                        <p className="text-slate-500">Try adjusting your filters or search keywords.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="mb-2 text-sm font-semibold text-slate-500">
                            Showing {filteredJobs.length} active job(s)
                        </div>

                        {filteredJobs.map((job) => (
                            <div key={job._id} className="relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md md:flex-row md:p-8">
                                {job.status !== 'active' && (
                                    <div className="absolute right-4 top-4 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                                        Closed for Applications
                                    </div>
                                )}

                                <div className="grow">
                                    <h3 className="mb-2 text-2xl font-bold text-slate-900">{job.job_title}</h3>

                                    <div className="mb-4 mt-2 flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                                        <span className="flex items-center gap-1.5"><BriefcaseIcon className="h-4 w-4 text-slate-400" /> {job.recruiter_id?.company?.company_name || 'Hiring Company'}</span>
                                        <span className="flex items-center gap-1.5"><MapPinIcon className="h-4 w-4 text-slate-400" /> {job.location || 'Remote'}</span>
                                        <span className="flex items-center gap-1.5"><ClockIcon className="h-4 w-4 text-slate-400" /> {job.requirements?.experience_years || 0}+ Years Exp</span>
                                    </div>

                                    <p className="mb-6 line-clamp-2 text-sm text-slate-600 md:line-clamp-3">
                                        {job.description}
                                    </p>

                                    <div className="mb-4 md:mb-0">
                                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Required Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {job.requirements?.skills?.map((skill, idx) => (
                                                <span key={idx} className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex min-w-50 flex-col items-end justify-center border-t border-slate-100 pt-6 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                                    {applicationResults[job._id] ? (
                                        applicationResults[job._id].success ? (
                                            <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                                                <CheckCircle2Icon className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                                                <div className="text-sm font-bold text-emerald-800">Application Sent!</div>
                                                <div className="mt-1 text-xl font-black text-emerald-600">{applicationResults[job._id].score}% Match</div>
                                            </div>
                                        ) : (
                                            <div className="w-full rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-bold text-red-700">
                                                {applicationResults[job._id].message}
                                            </div>
                                        )
                                    ) : (
                                        <button
                                            onClick={() => handleApply(job._id)}
                                            disabled={applyingTo === job._id || job.status !== 'active'}
                                            className={`flex w-full items-center justify-center rounded-xl px-6 py-3 text-center font-bold shadow-sm transition-all ${job.status !== 'active'
                                                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                                : applyingTo === job._id
                                                    ? 'cursor-wait bg-indigo-400 text-white'
                                                    : !user
                                                        ? 'border-2 border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindJobs;
