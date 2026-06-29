import { Link } from 'react-router-dom';
import { Building2, Users, Target, Zap, Award, ArrowRight } from 'lucide-react';

const features = [
    {
        icon: Users,
        title: 'Access Top Talent',
        description: 'Connect with 50,000+ qualified candidates across all industries and skill levels.'
    },
    {
        icon: Target,
        title: 'AI-Powered Matching',
        description: 'Our intelligent algorithms find the perfect candidates for your open positions.'
    },
    {
        icon: Zap,
        title: 'Faster Hiring',
        description: 'Reduce time-to-hire by 60% with automated screening and smart recommendations.'
    },
    {
        icon: Award,
        title: 'Quality Candidates',
        description: 'All candidates are verified and pre-screened to ensure the highest quality matches.'
    }
];

const stats = [
    { value: '10k+', label: 'Active Candidates' },
    { value: '500+', label: 'Companies Hiring' },
    { value: '60%', label: 'Faster Hiring' },
    { value: '98%', label: 'Satisfaction Rate' }
];

const Employers = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            {/* Hero Section */}
            <section className="border-b border-slate-700/50 pb-20 pt-24 relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl space-y-8 text-center animate-fade-in">
                        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-400">
                            <Building2 className="h-4 w-4" />
                            <span>For Employers</span>
                        </div>

                        <h1 className="text-6xl font-black leading-tight">
                            <span className="text-white">Hire the Best Talent</span>
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">With AI Precision</span>
                        </h1>

                        <p className="mx-auto max-w-2xl text-xl leading-relaxed text-slate-300">
                            Join 500+ companies using our AI Hiring System to find, engage, and hire top talent faster than ever before.
                        </p>

                        <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
                            <Link to="/register" className="rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-smooth hover:-translate-y-0.5">
                                Post a Job Free
                            </Link>
                            <Link to="/about" className="rounded-xl border border-slate-700/50 bg-slate-800/50 px-8 py-4 text-lg font-bold text-slate-200 transition-smooth hover:bg-slate-700/50 hover:border-indigo-500/50">
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="border-b border-slate-700/50 bg-slate-900/50 py-16 relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="mb-2 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 md:text-5xl">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-medium uppercase tracking-wide text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto mb-16 max-w-3xl text-center animate-fade-in">
                        <h2 className="mb-4 text-4xl font-black text-white">
                            Why Top Companies Choose Us
                        </h2>
                        <p className="text-xl text-slate-300">
                            Everything you need to build your dream team without the manual screening process.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-8 transition-smooth hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/20 animate-fade-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                                        <Icon className="h-7 w-7 text-indigo-400" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                                    <p className="leading-relaxed text-slate-300">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="border-t border-slate-700/50 bg-slate-900/50 py-20 relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto mb-16 max-w-3xl text-center animate-fade-in">
                        <h2 className="mb-4 text-4xl font-black text-white">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-xl text-slate-300">
                            Choose the plan that works best for your hiring needs
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                        {[
                            { name: 'Starter', price: '$299', jobs: '5', features: ['AI Matching', 'Basic Analytics', 'Email Support'], popular: false },
                            { name: 'Professional', price: '$599', jobs: '15', features: ['Everything in Starter', 'Advanced Analytics', 'Priority Support', 'Custom Branding'], popular: true },
                            { name: 'Enterprise', price: 'Custom', jobs: 'Unlimited', features: ['Everything in Pro', 'Dedicated Account Manager', 'API Access', 'Custom Integration'], popular: false }
                        ].map((plan, index) => (
                            <div
                                key={index}
                                className={`relative rounded-2xl p-8 text-center transition-smooth animate-fade-in ${plan.popular
                                        ? 'border-2 border-indigo-500/50 bg-gradient-to-br from-indigo-900/40 to-slate-900 shadow-xl shadow-indigo-500/20'
                                        : 'border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 hover:-translate-y-0.5 hover:border-slate-700'
                                    }`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {plan.popular && (
                                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 transform">
                                        <span className="rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/30">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <h3 className="mb-2 text-2xl font-bold text-white">{plan.name}</h3>
                                <div className="mb-2 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">{plan.price}</div>
                                <div className="mb-6 text-sm text-slate-400">per month</div>
                                <div className="mb-6 border-b border-slate-700/50 pb-6 text-sm font-semibold text-slate-300">{plan.jobs} Job Posts</div>

                                <ul className="mb-8 space-y-4 text-left">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                            <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                                                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to="/register"
                                    className={`block w-full rounded-xl py-3 font-bold transition-smooth ${plan.popular
                                            ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-0.5'
                                            : 'bg-slate-800/50 text-slate-200 border border-slate-700/50 hover:bg-slate-700/50 hover:border-indigo-500/50'
                                        }`}
                                >
                                    Get Started
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative z-10">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl border border-slate-700/50 bg-gradient-to-br from-indigo-900/40 to-slate-900 p-12 text-center shadow-xl md:p-16 animate-fade-in">
                        <div className="mx-auto max-w-3xl space-y-8">
                            <h2 className="text-5xl font-black">
                                <span className="text-white">Ready to Build Your</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 ml-2">Dream Team?</span>
                            </h2>
                            <p className="text-xl text-slate-300">
                                Start hiring top talent today with our AI-powered platform.
                            </p>
                            <Link to="/register" className="inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-smooth hover:-translate-y-0.5">
                                Post Your First Job Free
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Employers;
