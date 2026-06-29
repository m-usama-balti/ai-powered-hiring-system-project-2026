import { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

const SeekerJobs = () => {

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applyingTo, setApplyingTo] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await API.get('/jobs');
            setJobs(data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            setMessage({ type: 'error', text: 'Failed to load jobs.' });
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId) => {
        setApplyingTo(jobId);
        setMessage({ type: '', text: '' });

        try {
            const response = await API.post(`/applications/${jobId}`);
            setMessage({
                type: 'success',
                text: `Success! You applied. AI Match Score: ${response.data.match_score}%`
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error applying to job.'
            });
        } finally {
            setApplyingTo(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-12 space-y-2 animate-fade-in">
                    <h2 className="text-5xl font-black text-white">Job Board</h2>
                    <p className="text-lg text-slate-300">Browse open positions and apply with your AI-parsed profile.</p>
                </div>

                {/* Message Display */}
                {message.text && (
                    <div className={`mb-8 px-6 py-4 rounded-xl font-semibold animate-fade-in border backdrop-blur-xl ${message.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-300 border-red-500/30'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block mb-4 w-8 h-8 border-2 border-indigo-500 border-t-indigo-300 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-medium">Loading available jobs...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-12 text-center">
                        <p className="text-slate-400 font-medium">No active jobs available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {jobs.map((job, idx) => (
                            <div
                                key={job._id}
                                className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-smooth hover:shadow-xl hover:shadow-indigo-500/20 animate-fade-in"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="relative z-10 space-y-4">
                                    {/* Title & Location */}
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-emerald-400 transition-all">
                                            {job.job_title}
                                        </h3>
                                        <span className="flex-shrink-0 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 text-indigo-300 text-xs px-3 py-1.5 rounded-full font-semibold uppercase tracking-widest border border-indigo-500/30">
                                            {job.location || 'Remote'}
                                        </span>
                                    </div>

                                    {/* Company */}
                                    <p className="text-sm text-slate-300 font-medium">
                                        {job.recruiter_id?.company?.company_name || 'Hiring Company'}
                                    </p>

                                    {/* Description */}
                                    <p className="text-slate-300 text-sm line-clamp-3 leading-relaxed">
                                        {job.description}
                                    </p>

                                    {/* Skills */}
                                    <div className="pt-4 border-t border-slate-700/50">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Required Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {job.requirements?.skills?.map((skill, sidx) => (
                                                <span
                                                    key={sidx}
                                                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-700/30 text-slate-300 border border-slate-700/50 hover:border-indigo-500/50 hover:text-indigo-300 transition-all"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Experience Requirement */}
                                    <p className="text-xs text-slate-400 font-medium pt-2">
                                        <span className="text-indigo-400">Min Experience:</span> {job.requirements?.experience_years || 0} years
                                    </p>
                                </div>

                                {/* Apply Button */}
                                <button
                                    onClick={() => handleApply(job._id)}
                                    disabled={applyingTo === job._id}
                                    className={`mt-6 w-full py-3 px-4 rounded-xl font-bold transition-smooth relative z-10 overflow-hidden ${applyingTo === job._id
                                            ? 'bg-indigo-600/60 text-indigo-200 cursor-wait'
                                            : 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-70'
                                        }`}
                                >
                                    {applyingTo === job._id ? 'Analyzing Match...' : 'Apply Now (1-Click)'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeekerJobs;
