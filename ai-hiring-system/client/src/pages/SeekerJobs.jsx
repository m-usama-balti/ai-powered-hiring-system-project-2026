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
        <div className="max-w-5xl mx-auto mt-10 p-6">
            <h2 className="text-3xl font-bold text-indigo-900 mb-2">Job Board</h2>
            <p className="text-slate-600 mb-8">Browse open positions and apply with your AI-parsed profile.</p>

            {message.text && (
                <div className={`mb-6 p-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <p className="text-slate-500 font-medium">Loading available jobs...</p>
            ) : jobs.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-lg shadow-sm border border-slate-200">
                    <p className="text-slate-500">No active jobs available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map((job) => (
                        <div key={job._id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-slate-900">{job.job_title}</h3>
                                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded font-semibold uppercase tracking-wide">
                                        {job.location || 'Remote'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mb-4 font-medium">
                                    {job.recruiter_id?.company?.company_name || 'Hiring Company'}
                                </p>
                                <p className="text-slate-700 text-sm mb-4 line-clamp-3">
                                    {job.description}
                                </p>

                                <div className="mb-6">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Required Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {job.requirements.skills.map((skill, idx) => (
                                            <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 font-medium">
                                        Min Experience: {job.requirements.experience_years} years
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleApply(job._id)}
                                disabled={applyingTo === job._id}
                                className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${applyingTo === job._id
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-700 hover:bg-indigo-800'
                                    }`}
                            >
                                {applyingTo === job._id ? 'Analyzing Match...' : 'Apply Now (1-Click)'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SeekerJobs;
