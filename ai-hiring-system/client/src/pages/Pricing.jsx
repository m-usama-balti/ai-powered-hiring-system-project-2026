import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
    const plans = [
        {
            name: "Job Seeker Basic",
            price: "Free",
            description: "Everything you need to get hired using AI.",
            features: ["AI Resume Parsing", "Basic Job Recommendations", "Application Tracking", "Standard Support"],
            buttonText: "Sign Up Free",
            highlight: false
        },
        {
            name: "Recruiter Pro",
            price: "$49",
            period: "/month",
            description: "Advanced AI tools for growing teams.",
            features: ["Unlimited Job Postings", "AI Candidate Ranking", "Interview Copilot Guides", "Hiring Analytics Dashboard", "Email Notifications"],
            buttonText: "Start 14-Day Trial",
            highlight: true
        },
        {
            name: "Enterprise ATS",
            price: "Custom",
            description: "Full-scale MLOps HR solution.",
            features: ["Custom AI Model Training", "Dedicated Account Manager", "White-label Dashboard", "API Access", "SLA Guarantee"],
            buttonText: "Contact Sales",
            highlight: false
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 text-center">
                <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-4 animate-fade-in">
                    <span className="text-white">Simple, transparent</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 ml-2">pricing</span>
                </h1>
                <p className="mt-6 max-w-2xl text-xl text-slate-300 mx-auto">Choose the plan that fits your hiring or job-seeking needs.</p>

                <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`rounded-2xl p-8 border backdrop-blur-xl flex flex-col transition-smooth animate-fade-in ${plan.highlight
                                    ? 'border-indigo-500/50 bg-gradient-to-br from-indigo-900/40 to-slate-900 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-500/20'
                                    : 'border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 hover:border-slate-700 hover:shadow-lg hover:shadow-slate-700/10'
                                }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {plan.highlight && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30">
                                    Most Popular
                                </span>
                            )}
                            <div className="mb-6 text-left">
                                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                                <p className="text-slate-400 text-sm mt-2">{plan.description}</p>
                                <div className="mt-6 flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">{plan.price}</span>
                                    {plan.period && <span className="text-slate-400 font-medium">{plan.period}</span>}
                                </div>
                            </div>
                            <ul className="flex-1 space-y-4 text-left mb-8">
                                {plan.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                        <span className="text-slate-300 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to="/login"
                                className={`w-full py-4 rounded-xl font-bold transition-smooth text-center ${plan.highlight
                                        ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-0.5'
                                        : 'bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:bg-slate-700/50 hover:border-indigo-500/50 hover:text-indigo-300'
                                    }`}
                            >
                                {plan.buttonText}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing;
