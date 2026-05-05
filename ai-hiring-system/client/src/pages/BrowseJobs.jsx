import { Search, MapPin, Clock, Briefcase, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BrowseJobs = () => {
    // Mock data for the public page to drive sign-ups
    const sampleJobs = [
        { title: "Senior Machine Learning Engineer", company: "DataSync Inc.", location: "Remote", type: "Full-time", tags: ["Python", "PyTorch"] },
        { title: "Frontend Developer (React)", company: "CloudScale", location: "Islamabad", type: "Full-time", tags: ["React", "TypeScript"] },
        { title: "Cloud DevOps Architect", company: "TechNova", location: "Remote", type: "Contract", tags: ["AWS", "Kubernetes"] },
        { title: "Product Manager", company: "AI Core", location: "Lahore", type: "Full-time", tags: ["Agile", "Strategy"] }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header & Search */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Discover your next opportunity</h1>
                    <p className="text-xl text-slate-500 mb-8">Browse hundreds of AI-curated tech roles worldwide.</p>

                    <div className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center">
                        <Search className="h-6 w-6 text-slate-400 ml-4 mr-2" />
                        <input type="text" placeholder="Search by job title, skill, or company..." className="w-full py-3 px-2 outline-none text-slate-800" />
                        <Link to="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors whitespace-nowrap">
                            Search
                        </Link>
                    </div>
                </div>

                {/* Job List */}
                <div className="grid grid-cols-1 gap-4">
                    {sampleJobs.map((job, idx) => (
                        <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{job.title}</h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium mb-4">
                                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.company}</span>
                                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {job.type}</span>
                                </div>
                                <div className="flex gap-2">
                                    {job.tags.map((tag, tIdx) => (
                                        <span key={tIdx} className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <Link to="/login" className="w-full md:w-auto bg-slate-50 text-indigo-600 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex justify-center items-center gap-2">
                                Apply with AI <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link to="/login" className="inline-block text-indigo-600 font-bold hover:underline text-lg">
                        Sign up to see 500+ more jobs and get your AI Match Score &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BrowseJobs;
