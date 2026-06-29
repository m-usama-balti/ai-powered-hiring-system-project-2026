import { BookOpen, ArrowRight, Clock } from 'lucide-react';

const CareerAdvice = () => {
    const articles = [
        { category: "Interviews", title: "How to Answer 'Tell Me About Yourself'", readTime: "5 min read", date: "April 12, 2026" },
        { category: "Resumes", title: "Passing the ATS: Keywords You Need", readTime: "8 min read", date: "April 10, 2026" },
        { category: "Networking", title: "Cold Messaging Recruiters on LinkedIn", readTime: "4 min read", date: "April 05, 2026" },
        { category: "Salary", title: "Negotiating Your First Tech Offer", readTime: "10 min read", date: "March 28, 2026" },
        { category: "AI Tools", title: "Using AI Copilots to Prep for Interviews", readTime: "6 min read", date: "March 22, 2026" },
        { category: "Career", title: "Transitioning from Junior to Mid-Level", readTime: "7 min read", date: "March 15, 2026" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex items-center gap-4 mb-16 animate-fade-in">
                    <div className="bg-indigo-500/20 border border-indigo-500/30 p-4 rounded-2xl"><BookOpen className="h-8 w-8 text-indigo-400" /></div>
                    <div>
                        <h1 className="text-5xl font-black text-white">Career Advice</h1>
                        <p className="text-slate-300 mt-2 text-lg">Expert insights to help you land your dream job.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article, idx) => (
                        <div
                            key={idx}
                            className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-8 hover:border-indigo-500/50 transition-smooth hover:shadow-xl hover:shadow-indigo-500/20 cursor-pointer group flex flex-col justify-between h-64 animate-fade-in"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div>
                                <span className="text-xs font-black uppercase tracking-wider text-indigo-400 mb-3 block">{article.category}</span>
                                <h2 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-emerald-400 transition-all leading-tight">{article.title}</h2>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-700/50 pt-4 mt-6">
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                    <Clock className="h-4 w-4" /> {article.readTime}
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CareerAdvice;
