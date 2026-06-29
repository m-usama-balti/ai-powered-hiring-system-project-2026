import { useState } from 'react';
import { CheckCircle2, Settings, Lock, AlertCircle } from 'lucide-react';

const CookiePolicy = () => {
    const [activeSection, setActiveSection] = useState(0);

    const sections = [
        { id: 'intro', title: 'Introduction', icon: AlertCircle },
        { id: 'what', title: 'What Are Cookies', icon: Settings },
        { id: 'types', title: 'Types of Cookies', icon: Lock },
        { id: 'analytics', title: 'Analytics', icon: CheckCircle2 },
        { id: 'functional', title: 'Functional', icon: CheckCircle2 },
        { id: 'marketing', title: 'Marketing', icon: CheckCircle2 },
        { id: 'third-party', title: 'Third-Party', icon: Lock },
        { id: 'manage', title: 'Managing Cookies', icon: Settings }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            {/* Hero Section */}
            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center animate-fade-in">
                    <h1 className="text-6xl font-black mb-4">
                        <span className="text-white">Cookie</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 ml-3">Policy</span>
                    </h1>
                    <p className="text-xl text-slate-300">Transparent information about how TalentAI uses cookies</p>
                    <p className="text-sm text-slate-500 mt-4">Last updated: May 25, 2026</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Table of Contents - Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-6">
                            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Contents</h3>
                            <nav className="space-y-3">
                                {sections.map((section, idx) => {
                                    const Icon = section.icon;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveSection(idx)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${activeSection === idx
                                                ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                                }`}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            {section.title}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-8 md:p-12 space-y-8">
                            {/* Introduction */}
                            <section className="space-y-4 animate-fade-in">
                                <h2 className="text-3xl font-bold text-white">Introduction</h2>
                                <p className="text-slate-300 leading-relaxed">
                                    TalentAI uses cookies and similar tracking technologies to enhance your browsing experience, understand how you use our platform, and deliver personalized content. This Cookie Policy explains what cookies are, how we use them, and your choices regarding their use.
                                </p>
                            </section>

                            {/* What Are Cookies */}
                            <section className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
                                <h2 className="text-3xl font-bold text-white">What Are Cookies?</h2>
                                <p className="text-slate-300 leading-relaxed">
                                    Cookies are small text files stored on your device (computer, tablet, or mobile phone) when you visit a website. They contain information that allows the website to remember your preferences, login information, and browsing behavior.
                                </p>
                                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4 mt-4">
                                    <p className="text-slate-300 text-sm"><strong className="text-indigo-300">Types:</strong> Session cookies (temporary) vs. Persistent cookies (long-term)</p>
                                </div>
                            </section>

                            {/* Types of Cookies */}
                            <section className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
                                <h2 className="text-3xl font-bold text-white">Types of Cookies We Use</h2>
                                <p className="text-slate-300 leading-relaxed">We use the following categories of cookies on TalentAI:</p>
                            </section>

                            {/* Analytics Cookies */}
                            <section className="space-y-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                        <span className="text-indigo-400 font-bold">1</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Analytics Cookies</h3>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                    These cookies help us understand how visitors interact with our platform. They collect information about pages visited, time spent, and user actions. This data helps us improve our services.
                                </p>
                                <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                                    <p className="text-slate-300 text-sm"><strong className="text-emerald-300">Examples:</strong> Google Analytics, Mixpanel</p>
                                    <p className="text-slate-400 text-sm">These cookies do not identify you personally.</p>
                                </div>
                            </section>

                            {/* Functional Cookies */}
                            <section className="space-y-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <span className="text-emerald-400 font-bold">2</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Functional Cookies</h3>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                    These cookies enable essential features like user authentication, session management, and preference storage. Without them, the platform wouldn't function properly.
                                </p>
                                <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                                    <p className="text-slate-300 text-sm"><strong className="text-emerald-300">Examples:</strong> Authentication tokens, user preferences, language settings</p>
                                    <p className="text-slate-400 text-sm">Required for core platform functionality.</p>
                                </div>
                            </section>

                            {/* Marketing Cookies */}
                            <section className="space-y-4 animate-fade-in" style={{ animationDelay: '500ms' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <span className="text-blue-400 font-bold">3</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Marketing Cookies</h3>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                    These cookies track your browsing patterns to deliver personalized advertisements and understand marketing campaign effectiveness.
                                </p>
                                <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                                    <p className="text-slate-300 text-sm"><strong className="text-blue-300">Examples:</strong> Facebook Pixel, LinkedIn Insight Tag, Google Ads</p>
                                    <p className="text-slate-400 text-sm">You can opt-out of these in cookie settings.</p>
                                </div>
                            </section>

                            {/* Third-Party Cookies */}
                            <section className="space-y-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                                        <span className="text-violet-400 font-bold">4</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Third-Party Cookies</h3>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                    Third-party services integrated into our platform (payment processors, analytics tools) may set their own cookies.
                                </p>
                                <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                                    <p className="text-slate-300 text-sm"><strong className="text-violet-300">Examples:</strong> Stripe, Google Analytics, Cloudflare</p>
                                    <p className="text-slate-400 text-sm">These are subject to their respective privacy policies.</p>
                                </div>
                            </section>

                            {/* Managing Cookies */}
                            <section className="space-y-4 animate-fade-in" style={{ animationDelay: '700ms' }}>
                                <h2 className="text-3xl font-bold text-white">How to Manage Cookies</h2>
                                <p className="text-slate-300 leading-relaxed">You have full control over cookies in your browser:</p>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 items-start">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Browser Settings</p>
                                            <p className="text-slate-400 text-sm">Most browsers allow you to control cookies through settings (Chrome, Firefox, Safari, Edge)</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Cookie Consent Banner</p>
                                            <p className="text-slate-400 text-sm">Use our cookie banner to manage preferences during your visit</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Opt-Out Links</p>
                                            <p className="text-slate-400 text-sm">Use opt-out mechanisms provided by advertising networks</p>
                                        </div>
                                    </li>
                                </ul>
                            </section>

                            {/* Contact Section */}
                            <section className="space-y-4 animate-fade-in" style={{ animationDelay: '800ms' }}>
                                <h2 className="text-3xl font-bold text-white">Questions?</h2>
                                <p className="text-slate-300 leading-relaxed">
                                    If you have any questions about our Cookie Policy, please contact our privacy team at:
                                </p>
                                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
                                    <p className="text-slate-200"><strong className="text-indigo-300">Email:</strong> privacy@talentai.com</p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicy;
