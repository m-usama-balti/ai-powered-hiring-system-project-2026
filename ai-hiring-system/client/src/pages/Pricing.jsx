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
        <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">Simple, transparent pricing</h1>
                <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">Choose the plan that fits your hiring or job-seeking needs.</p>

                <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <div key={index} className={`rounded-3xl p-8 bg-white border ${plan.highlight ? 'border-indigo-600 ring-2 ring-indigo-600 shadow-xl relative' : 'border-slate-200 shadow-sm'} flex flex-col`}>
                            {plan.highlight && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                                    Most Popular
                                </span>
                            )}
                            <div className="mb-6 text-left">
                                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                <p className="text-slate-500 text-sm mt-2">{plan.description}</p>
                                <div className="mt-6 flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                                    {plan.period && <span className="text-slate-500 font-medium">{plan.period}</span>}
                                </div>
                            </div>
                            <ul className="flex-1 space-y-4 text-left mb-8">
                                {plan.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0" />
                                        <span className="text-slate-700 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/login" className={`w-full py-4 rounded-xl font-bold transition-all text-center ${plan.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'}`}>
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
