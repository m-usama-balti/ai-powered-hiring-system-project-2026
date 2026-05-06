import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { BrainCircuit, ShieldAlert, FileText, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);
    const dashboardPath = user?.user_type === 'admin' ? '/admin' : user?.user_type === 'recruiter' ? '/recruiter' : '/seeker';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50"></div>
                <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl"></div>
                <div className="absolute top-40 left-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl"></div>
                <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-20 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-indigo-700 shadow-sm">
                                <Sparkles className="h-4 w-4" /> AI-Powered Applicant Tracking
                            </div>
                            <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-slate-900 sm:text-6xl">
                                Hiring intelligence that <span className="text-indigo-600">removes bias</span> and accelerates growth.
                            </h1>
                            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
                                AI-Powered Applicant Tracking &amp; Bias Elimination. Our NLP engine parses resumes, calculates TF-IDF match scores, and verifies safety signals so teams hire faster with confidence.
                            </p>

                            {!user ? (
                                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <Link
                                        to="/register?role=job_seeker"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-200/60 transition-all hover:bg-indigo-700"
                                    >
                                        Find a Job <ArrowRight className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        to="/register?role=recruiter"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-bold text-slate-800 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50"
                                    >
                                        Hire Talent
                                    </Link>
                                    <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-indigo-600">
                                        Already have an account? Sign in
                                    </Link>
                                </div>
                            ) : (
                                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <Link
                                        to={dashboardPath}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-200/60 transition-all hover:bg-indigo-700"
                                    >
                                        Go to Dashboard <ArrowRight className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        to="/jobs"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-bold text-slate-800 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50"
                                    >
                                        Explore Jobs
                                    </Link>
                                </div>
                            )}

                            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-500">
                                <span>Trusted by modern teams</span>
                                <div className="flex flex-wrap gap-4 text-slate-400">
                                    <span className="uppercase tracking-widest">NovaLabs</span>
                                    <span className="uppercase tracking-widest">SignalHR</span>
                                    <span className="uppercase tracking-widest">CloudForge</span>
                                    <span className="uppercase tracking-widest">TalentIQ</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-indigo-200/50 via-white to-emerald-200/40 blur-2xl"></div>
                            <div className="relative rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">AI Match Score</p>
                                        <p className="text-3xl font-black text-slate-900">92% Fit</p>
                                    </div>
                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Verified</span>
                                </div>
                                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-slate-700">Senior Frontend Engineer</p>
                                        <span className="text-xs font-semibold text-indigo-600">TF-IDF 0.89</span>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {['React', 'TypeScript', 'UI Systems', 'A11y'].map((tag) => (
                                            <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                        <ShieldAlert className="h-5 w-5 text-emerald-600" />
                                        <p className="text-xs font-semibold text-emerald-800">
                                            Safety scan passed. Content verified by NLP classifier.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <p className="text-xs font-semibold uppercase text-slate-400">Time to Shortlist</p>
                                        <p className="text-2xl font-black text-slate-900">-62%</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <p className="text-xs font-semibold uppercase text-slate-400">Bias Reduction</p>
                                        <p className="text-2xl font-black text-slate-900">94%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {[
                        {
                            icon: FileText,
                            title: 'AI Resume NLP Parsing',
                            description: 'Extract structured skills, roles, and education instantly from PDF or DOCX resumes.'
                        },
                        {
                            icon: BrainCircuit,
                            title: 'Smart TF-IDF Matching',
                            description: 'Rank candidates by semantic alignment and deliver explainable match scores in seconds.'
                        },
                        {
                            icon: ShieldAlert,
                            title: 'AI Safety & Spam Detection',
                            description: 'Detect suspicious listings and protect your pipeline with automated NLP safety scans.'
                        }
                    ].map((feature) => (
                        <div key={feature.title} className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl">
                            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-emerald-100">
                                <feature.icon className="h-7 w-7 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-slate-900 py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <h2 className="text-4xl font-black text-white mb-4">Built for speed, trust, and fairness</h2>
                            <p className="text-lg text-slate-300 leading-relaxed">
                                Deliver consistent hiring outcomes across teams. Our pipeline combines explainable AI scoring, bias elimination, and real-time safety scans for every requisition.
                            </p>
                            <div className="mt-8 space-y-4">
                                {[
                                    'Instant resume extraction with spaCy NLP',
                                    'Explainable TF-IDF matching with transparent scores',
                                    'Integrated spam and safety screening'
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-3 text-slate-200">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                        <span className="font-semibold">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { label: 'Hiring velocity', value: '3.4x faster' },
                                { label: 'Shortlist accuracy', value: '91%' },
                                { label: 'Automation coverage', value: '87%' },
                                { label: 'Candidate satisfaction', value: '4.9/5' }
                            ].map((stat) => (
                                <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-800/70 p-6 text-center">
                                    <p className="text-2xl font-black text-white">{stat.value}</p>
                                    <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-12 text-center text-white shadow-2xl">
                    <h2 className="text-3xl font-black sm:text-4xl">Ready to experience AI-first hiring?</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-indigo-100">
                        Get matched faster, reduce bias, and deliver world-class candidate experiences with TalentAI.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link to="/register" className="rounded-xl bg-white px-6 py-3 text-base font-bold text-indigo-700 shadow-sm transition-all hover:bg-indigo-50">
                            Start Free Trial
                        </Link>
                        <Link to="/contact" className="rounded-xl border border-indigo-200 px-6 py-3 text-base font-bold text-white transition-all hover:bg-indigo-600">
                            Talk to Sales
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
