import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { BrainCircuit, ShieldAlert, FileText, ArrowRight, Sparkles, CheckCircle2, Zap, Target, Shield, TrendingUp, Users, Clock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);
    const dashboardPath = user?.user_type === 'admin' ? '/admin' : user?.user_type === 'recruiter' ? '/recruiter' : '/seeker';
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
            {/* Animated background elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-600/20 to-transparent blur-3xl animate-pulse"></div>
                <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-600/10 to-transparent blur-3xl animate-pulse delay-700"></div>
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-600/10 to-transparent blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Hero Section */}
            <section className="relative px-6 py-24 lg:px-8 overflow-hidden">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Content */}
                        <div className="z-10 space-y-8 animate-fade-in">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 backdrop-blur-sm hover:border-indigo-500/50 transition-all duration-300 w-fit">
                                <Sparkles className="h-4 w-4 text-indigo-400" />
                                <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Next-Gen AI Hiring</span>
                            </div>

                            {/* Main Headline */}
                            <div>
                                <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tight">
                                    <span className="block text-white mb-2">Reimagine</span>
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-blue-400 animate-pulse">Hiring</span>
                                    <span className="block text-white">with AI</span>
                                </h1>
                                <div className="h-1 w-20 bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full mt-4"></div>
                            </div>

                            {/* Subheading */}
                            <p className="text-lg lg:text-xl text-slate-300 leading-relaxed max-w-xl">
                                Eliminate bias, accelerate hiring, and discover top talent with our AI-powered platform. TF-IDF matching, safety screening, and transparent scoring in seconds.
                            </p>

                            {/* CTA Buttons */}
                            {!user ? (
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Link
                                        to="/register?role=job_seeker"
                                        className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow-2xl shadow-indigo-500/50 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:shadow-indigo-500/70 hover:-translate-y-1"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Find a Job <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </Link>
                                    <Link
                                        to="/register?role=recruiter"
                                        className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold rounded-2xl border-2 border-indigo-500/50 text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-indigo-400 transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <span className="flex items-center gap-2">
                                            Hire Talent <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Link
                                        to={dashboardPath}
                                        className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow-2xl shadow-indigo-500/50 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:shadow-indigo-500/70 hover:-translate-y-1"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Go to Dashboard <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Link>
                                    <Link
                                        to="/jobs"
                                        className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold rounded-2xl border-2 border-emerald-500/50 text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-emerald-400 transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <span className="flex items-center gap-2">
                                            Explore Jobs <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Link>
                                </div>
                            )}

                            {/* Social Proof */}
                            <div className="pt-8 border-t border-slate-700">
                                <p className="text-sm font-semibold text-slate-400 mb-4">Trusted by leading organizations</p>
                                <div className="flex flex-wrap gap-6 text-slate-400">
                                    {['NovaLabs', 'SignalHR', 'CloudForge', 'TalentIQ'].map((company) => (
                                        <span key={company} className="text-sm font-semibold uppercase tracking-widest hover:text-indigo-400 transition-colors">
                                            {company}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Interactive Card */}
                        <div className="relative lg:h-full">
                            {/* Glowing border effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-emerald-600 to-blue-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>

                            {/* Main Card */}
                            <div className="relative rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 via-slate-800/50 to-slate-900/80 backdrop-blur-xl p-8 shadow-2xl overflow-hidden">
                                {/* Background pattern */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 pointer-events-none"></div>

                                <div className="relative z-10 space-y-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">AI Match Intelligence</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-4xl font-black text-white">92%</p>
                                                <p className="text-sm text-emerald-400 font-semibold">Match Score</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/50">
                                            <span className="text-xs font-bold text-emerald-300">Verified</span>
                                        </div>
                                    </div>

                                    {/* Job Details */}
                                    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-6 space-y-4">
                                        <div>
                                            <p className="text-sm font-bold text-white">Senior Frontend Engineer</p>
                                            <p className="text-xs text-slate-400 mt-1">🏢 Tech Company • San Francisco, CA</p>
                                        </div>

                                        {/* Skills */}
                                        <div className="flex flex-wrap gap-2">
                                            {['React', 'TypeScript', 'UI Design', 'A11y'].map((skill) => (
                                                <span key={skill} className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 text-indigo-300 hover:border-indigo-400 transition-colors">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Score Breakdown */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-400">TF-IDF Relevance</span>
                                                <span className="font-bold text-emerald-400">0.89</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                                                <div className="h-full w-[89%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Safety Check */}
                                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm p-4 flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs font-semibold text-emerald-300">
                                            Safety scan verified. Content authenticated by NLP classifier with 99.2% confidence.
                                        </p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-4 text-center group hover:border-indigo-500/50 transition-colors">
                                            <p className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors">-62%</p>
                                            <p className="text-xs text-slate-400 mt-2 font-semibold">Shortlist Time</p>
                                        </div>
                                        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-4 text-center group hover:border-emerald-500/50 transition-colors">
                                            <p className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">94%</p>
                                            <p className="text-xs text-slate-400 mt-2 font-semibold">Bias Reduction</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative px-6 py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-black mb-4">
                            <span className="text-white">Powerful Features,</span><br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Built for Success</span>
                        </h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            Everything you need to streamline hiring and make data-driven decisions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: FileText,
                                title: 'AI Resume Parsing',
                                description: 'Extract skills, education, and experience from resumes with advanced NLP. Support for PDF, DOCX, and more formats.',
                                color: 'from-indigo-500/20'
                            },
                            {
                                icon: BrainCircuit,
                                title: 'Smart Matching Engine',
                                description: 'TF-IDF semantic alignment for precise candidate-job fit scoring. Transparent, explainable results.',
                                color: 'from-emerald-500/20'
                            },
                            {
                                icon: ShieldAlert,
                                title: 'Safety & Verification',
                                description: 'Automated spam detection and content verification. Protect your pipeline with AI-powered safety scans.',
                                color: 'from-blue-500/20'
                            }
                        ].map((feature, index) => (
                            <div
                                key={feature.title}
                                className="group relative"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Glow effect */}
                                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                {/* Card */}
                                <div className="relative rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8 space-y-6 hover:border-slate-600/70 transition-all duration-300 overflow-hidden">
                                    {/* Icon */}
                                    <div className={`inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} to-transparent border border-slate-700/50 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="h-8 w-8 text-emerald-400" />
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-emerald-400 transition-all">
                                            {feature.title}
                                        </h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <div className="pt-4 inline-block">
                                        <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-2 transition-all duration-300" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section with Glassmorphism */}
            <section className="relative px-6 py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Content */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-4xl lg:text-5xl font-black mb-4">
                                    <span className="text-white">Built for Speed,</span><br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Trust & Fairness</span>
                                </h2>
                                <div className="h-1 w-24 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full mt-4"></div>
                            </div>

                            <p className="text-lg text-slate-300 leading-relaxed">
                                Deliver consistent hiring outcomes across your organization. Our intelligent pipeline combines AI-driven insights, bias elimination, and real-time verification for every candidate.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { icon: Zap, text: 'Resume parsing in milliseconds with spaCy NLP' },
                                    { icon: Target, text: 'Explainable TF-IDF scoring with transparent reasoning' },
                                    { icon: Shield, text: 'Real-time spam and safety screening automation' }
                                ].map((item) => (
                                    <div key={item.text} className="flex items-center gap-4 group cursor-pointer">
                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/30 group-hover:border-emerald-400 transition-colors">
                                            <item.icon className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <span className="text-slate-200 font-semibold group-hover:text-white transition-colors">
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Stats Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { value: '3.4x', label: 'Hiring Velocity Increase' },
                                { value: '91%', label: 'Shortlist Accuracy Rate' },
                                { value: '87%', label: 'Process Automation' },
                                { value: '4.9/5', label: 'Candidate Experience' }
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="group relative rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8 text-center hover:border-indigo-500/50 transition-all duration-300 overflow-hidden"
                                >
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    <div className="relative z-10">
                                        <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 mb-2">
                                            {stat.value}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
                                            {stat.label}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="relative px-6 py-20 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-black mb-4">
                            <span className="text-white">Why Choose</span><br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-blue-400">TalentAI</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Users, title: 'Inclusive by Design', description: 'Eliminate unconscious bias with data-driven decision making and diverse pipeline analytics.' },
                            { icon: TrendingUp, title: 'Proven Results', description: '3.4x faster hiring, 91% accuracy, and 94% bias reduction across all metrics.' },
                            { icon: Clock, title: 'Time to Hire', description: 'Reduce time-to-hire from weeks to days with our intelligent automation pipeline.' }
                        ].map((item) => (
                            <div key={item.title} className="text-center space-y-4 group cursor-pointer">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 group-hover:border-indigo-400 transition-colors mx-auto group-hover:scale-110 transform duration-300">
                                    <item.icon className="h-8 w-8 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative px-6 py-20 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    {/* Glowing background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-emerald-600/20 to-blue-600/20 rounded-3xl blur-2xl"></div>

                    {/* Card */}
                    <div className="relative rounded-3xl border border-slate-600/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-emerald-500/5 pointer-events-none"></div>

                        {/* Content */}
                        <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-20 text-center space-y-8">
                            <h2 className="text-4xl lg:text-5xl font-black">
                                <span className="text-white">Ready to Transform</span><br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Your Hiring?</span>
                            </h2>

                            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                                Join hundreds of companies reducing bias, accelerating hiring, and discovering top talent with AI-powered intelligence. Start your free trial today.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Link
                                    to="/register"
                                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow-2xl shadow-indigo-500/50 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:shadow-indigo-500/70 hover:-translate-y-1"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Start Free Trial <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                                <Link
                                    to="/contact"
                                    className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl border-2 border-slate-600/50 text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-indigo-400/50 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <span className="flex items-center gap-2">
                                        Schedule Demo <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                            </div>

                            <p className="text-sm text-slate-500">No credit card required. Full access for 14 days.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
