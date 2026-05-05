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
        <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-12">
                    <div className="bg-indigo-100 p-4 rounded-2xl"><BookOpen className="h-8 w-8 text-indigo-600" /></div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900">Career Advice</h1>
                        <p className="text-slate-500 mt-1 text-lg">Expert insights to help you land your dream job.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article, idx) => (
                        <div key={idx} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-64">
                            <div>
                                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 mb-3 block">{article.category}</span>
                                <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{article.title}</h2>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-6">
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                    <Clock className="h-4 w-4" /> {article.readTime}
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CareerAdvice;
