import { useState } from 'react';
import { Search, Calendar, User, ArrowRight, Flame, Mail } from 'lucide-react';

const Blog = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = ['All', 'AI Hiring', 'Resume Tips', 'Interviews', 'Remote Jobs', 'Career Growth'];

    const featuredArticle = {
        id: 1,
        title: 'How AI is Revolutionizing Recruitment',
        excerpt: 'Discover how artificial intelligence is transforming the hiring landscape and what it means for job seekers and employers.',
        author: 'Sarah Chen',
        date: 'May 20, 2026',
        readTime: '8 min read',
        image: 'AI Hiring',
        category: 'AI Hiring'
    };

    const blogArticles = [
        {
            id: 2,
            title: 'Optimizing Your Resume for AI Screening',
            excerpt: 'Learn the best practices to ensure your resume passes through AI screening systems and reaches hiring managers.',
            author: 'Alex Johnson',
            date: 'May 18, 2026',
            readTime: '6 min read',
            category: 'Resume Tips'
        },
        {
            id: 3,
            title: 'The Future of Remote Work in Tech',
            excerpt: 'Explore emerging trends in remote work and how companies are adapting their hiring strategies for distributed teams.',
            author: 'Emma Davis',
            date: 'May 15, 2026',
            readTime: '7 min read',
            category: 'Remote Jobs'
        },
        {
            id: 4,
            title: 'Top 10 Interview Questions and How to Answer Them',
            excerpt: 'Master the most commonly asked interview questions with expert tips and sample answers to impress your next employer.',
            author: 'Michael Torres',
            date: 'May 12, 2026',
            readTime: '10 min read',
            category: 'Interviews'
        },
        {
            id: 5,
            title: 'Building Your Personal Brand in Tech',
            excerpt: 'Develop a strong personal brand that attracts recruiters and opens doors to exciting career opportunities.',
            author: 'Jessica Lee',
            date: 'May 10, 2026',
            readTime: '9 min read',
            category: 'Career Growth'
        },
        {
            id: 6,
            title: 'The Complete Guide to LinkedIn Optimization',
            excerpt: 'Transform your LinkedIn profile into a powerful tool for career advancement and networking in the digital age.',
            author: 'David Wilson',
            date: 'May 8, 2026',
            readTime: '12 min read',
            category: 'Resume Tips'
        },
        {
            id: 7,
            title: 'Negotiating Your Tech Salary Successfully',
            excerpt: 'Learn proven strategies to negotiate a competitive salary and benefits package in the technology industry.',
            author: 'Patricia Brown',
            date: 'May 5, 2026',
            readTime: '8 min read',
            category: 'Career Growth'
        },
        {
            id: 8,
            title: 'AI Tools Every Job Seeker Should Know',
            excerpt: 'Discover cutting-edge AI tools that can accelerate your job search and help you land your dream role.',
            author: 'Robert Martinez',
            date: 'May 1, 2026',
            readTime: '7 min read',
            category: 'AI Hiring'
        },
        {
            id: 9,
            title: 'Succeeding in Remote Job Interviews',
            excerpt: 'Master the unique challenges of video interviews and remote assessment processes used by modern companies.',
            author: 'Nicole Anderson',
            date: 'April 28, 2026',
            readTime: '6 min read',
            category: 'Interviews'
        }
    ];

    const filteredArticles = activeCategory === 'all'
        ? blogArticles
        : blogArticles.filter(article => article.category === activeCategory);

    const trendingArticles = blogArticles.slice(0, 3);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            {/* Hero Section */}
            <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center animate-fade-in">
                    <h1 className="text-6xl font-black mb-4">
                        <span className="text-white">Career Insights &</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 ml-3">Industry News</span>
                    </h1>
                    <p className="text-xl text-slate-300">
                        Expert articles on hiring, careers, and the future of work
                    </p>
                </div>
            </section>

            {/* Search Bar */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* Featured Article */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/40 to-slate-900 backdrop-blur-xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/20 animate-fade-in">
                        <div className="p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Flame className="h-5 w-5 text-orange-400" />
                                    <span className="text-sm font-bold text-orange-400 uppercase tracking-wider">Featured Article</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-white">{featuredArticle.title}</h2>
                                <p className="text-slate-300 text-lg">{featuredArticle.excerpt}</p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <User className="h-4 w-4" />
                                        <span className="text-sm">{featuredArticle.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm">{featuredArticle.date}</span>
                                    </div>
                                    <div className="text-sm text-emerald-400 font-medium">{featuredArticle.readTime}</div>
                                </div>
                                <button className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 mt-2">
                                    Read Article
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                                <span className="text-5xl md:text-6xl">✨</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map((category, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveCategory(category === 'All' ? 'all' : category)}
                                className={`px-5 py-2.5 rounded-full font-bold transition-all animate-fade-in ${(category === 'All' && activeCategory === 'all') || activeCategory === category
                                        ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-indigo-500/50'
                                    }`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Articles Grid */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.map((article, idx) => (
                            <div
                                key={article.id}
                                className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 animate-fade-in flex flex-col"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="mb-4">
                                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                                        {article.category}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{article.title}</h3>
                                <p className="text-slate-400 text-sm mb-6 line-clamp-3 flex-1">{article.excerpt}</p>
                                <div className="space-y-3 pt-4 border-t border-slate-700/50">
                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {article.author}
                                        </div>
                                        <span className="text-emerald-400">{article.readTime}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <Calendar className="h-3 w-3" />
                                        {article.date}
                                    </div>
                                    <button className="w-full py-2 rounded-lg bg-slate-800/50 text-slate-300 text-sm font-bold hover:bg-slate-700/50 hover:text-slate-100 transition-all">
                                        Read More
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending Articles */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-black text-white mb-8 animate-fade-in">Trending This Week</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {trendingArticles.map((article, idx) => (
                            <div
                                key={article.id}
                                className="rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-xl p-4 hover:border-emerald-500/50 transition-all animate-fade-in"
                                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                            >
                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-1">
                                        <Flame className="h-4 w-4 text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white text-sm line-clamp-2">{article.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{article.readTime}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 to-slate-900 backdrop-blur-xl p-8 md:p-12 text-center animate-fade-in">
                        <Mail className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-black text-white mb-3">Stay Updated</h2>
                        <p className="text-slate-300 mb-6">Get weekly insights on hiring, careers, and industry trends delivered to your inbox.</p>
                        <div className="flex gap-3">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="flex-1 px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all"
                            />
                            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5">
                                Subscribe
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">We respect your privacy. Unsubscribe anytime.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Blog;
