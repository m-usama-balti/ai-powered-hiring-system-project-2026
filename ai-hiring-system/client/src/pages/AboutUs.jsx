import { Target, Users, Zap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-6">
                        Bridging the gap between <span className="text-indigo-600">Talent and Opportunity</span>.
                    </h1>
                    <p className="text-xl text-slate-500 leading-relaxed">
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
                        <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="bg-indigo-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                                <value.icon className="h-7 w-7 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                            <p className="text-slate-500 leading-relaxed">{value.desc}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="bg-indigo-900 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to transform your hiring?</h2>
                    <p className="text-indigo-200 mb-8 max-w-2xl mx-auto">Join thousands of job seekers and modern HR teams building the future of work.</p>
                    <div className="flex justify-center gap-4">
                        <Link to="/login" className="bg-white text-indigo-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors">Get Started</Link>
                        <Link to="/contact" className="bg-indigo-800 border border-indigo-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Contact Sales</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
