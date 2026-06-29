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
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16 space-y-4 animate-fade-in">
                    <h1 className="text-5xl lg:text-6xl font-black leading-tight">
                        <span className="text-white block mb-2">Discover your next</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-blue-400">
                            opportunity
                        </span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Browse hundreds of AI-curated tech roles worldwide. Get matched with opportunities perfect for your profile.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-3xl mx-auto mb-16 group">
                    <div className="relative rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-2 shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-smooth overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="flex items-center gap-3 relative z-10">
                            <Search className="h-6 w-6 text-indigo-400 ml-4" />
                            <input
                                type="text"
                                placeholder="Search by job title, skill, or company..."
                                className="w-full bg-transparent py-4 px-2 outline-none text-slate-100 placeholder-slate-400 font-medium text-lg"
                            />
                            <Link to="/login" className="bg-gradient-to-r from-indigo-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-smooth hover:-translate-y-0.5 whitespace-nowrap mr-2">
                                Search
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Job Cards */}
                <div className="grid grid-cols-1 gap-4 mb-12">
                    {sampleJobs.map((job, idx) => (
                        <div
                            key={idx}
                            className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-6 md:p-8 hover:border-indigo-500/50 transition-smooth hover:shadow-xl hover:shadow-indigo-500/20 animate-fade-in"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-emerald-500/0 group-hover:from-indigo-500/5 group-hover:via-transparent group-hover:to-emerald-500/5 transition-all duration-500"></div>

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex-1 space-y-3">
                                    <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-emerald-400 transition-all">
                                        {job.title}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 font-medium">
                                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                                            <Briefcase className="h-4 w-4 text-indigo-400" />
                                            {job.company}
                                        </span>
                                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                                            <MapPin className="h-4 w-4 text-emerald-400" />
                                            {job.location}
                                        </span>
                                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                                            <Clock className="h-4 w-4 text-blue-400" />
                                            {job.type}
                                        </span>
                                    </div>

                                    <div className="flex gap-2 flex-wrap pt-2">
                                        {job.tags.map((tag, tIdx) => (
                                            <span
                                                key={tIdx}
                                                className="text-xs font-bold px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 hover:bg-gradient-to-r hover:from-indigo-500/30 hover:to-emerald-500/30 transition-all"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <Link
                                    to="/login"
                                    className="w-full md:w-auto px-8 py-3 rounded-xl font-bold bg-slate-700/30 border border-slate-700/50 text-slate-200 hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-emerald-500/20 hover:border-indigo-500/50 transition-smooth hover:text-indigo-300 flex justify-center items-center gap-2 hover:-translate-y-0.5"
                                >
                                    Apply with AI <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="text-center space-y-6 pt-8 border-t border-slate-700/50">
                    <p className="text-lg text-slate-300">
                        <span className="text-white font-bold">500+</span> more jobs waiting for you
                    </p>
                    <Link
                        to="/login"
                        className="inline-block px-10 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-emerald-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-smooth hover:-translate-y-0.5"
                    >
                        Sign up to see all jobs and get your AI Match Score →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BrowseJobs;
