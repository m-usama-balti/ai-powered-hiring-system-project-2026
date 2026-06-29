import { Target, Users, Zap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
                    <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
                        <span className="text-white block mb-2">Bridging the gap between</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-blue-400">
                            Talent and Opportunity
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed">
                        Founded in 2026, TalentAI is a cutting-edge MLOps platform designed to eliminate hiring bias. Our proprietary Natural Language Processing engine connects the right candidates with the right roles, instantly.
                    </p>
                </div>

                {/* Core Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {[
                        { icon: Target, title: "Precision Matching", desc: "Our TF-IDF algorithm ensures candidates are ranked entirely on merit and skill overlap." },
                        { icon: Zap, title: "Lightning Fast", desc: "Reduce time-to-hire from weeks to minutes with instant AI pipeline sorting." },
                        { icon: Users, title: "For Everyone", desc: "Whether you are a startup or an enterprise, our platform scales to your hiring needs." },
                        { icon: Globe, title: "Global Reach", desc: "We support remote, hybrid, and local roles across the global tech ecosystem." }
                    ].map((value, idx) => (
                        <div
                            key={idx}
                            className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-8 hover:border-indigo-500/50 transition-smooth hover:shadow-xl hover:shadow-indigo-500/20 animate-fade-in"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="bg-indigo-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
                                <value.icon className="h-7 w-7 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                            <p className="text-slate-300 leading-relaxed">{value.desc}</p>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-12 text-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-emerald-500/10 opacity-50 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black mb-4">
                            <span className="text-white">Ready to transform your</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 ml-2">hiring?</span>
                        </h2>
                        <p className="text-slate-300 mb-8 max-w-2xl mx-auto text-lg">Join thousands of job seekers and modern HR teams building the future of work.</p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <Link to="/login" className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-indigo-500/50 transition-smooth hover:-translate-y-0.5">Get Started</Link>
                            <Link to="/contact" className="px-8 py-3 rounded-xl font-bold bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:bg-slate-700/50 hover:border-indigo-500/50 transition-smooth">Contact Sales</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
