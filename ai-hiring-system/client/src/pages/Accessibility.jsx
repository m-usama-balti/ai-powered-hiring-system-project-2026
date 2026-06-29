import { Keyboard, Eye, Zap, Smartphone, Volume2, Heart, MessageSquare } from 'lucide-react';

const Accessibility = () => {
    const features = [
        {
            icon: Keyboard,
            title: 'Keyboard Navigation',
            description: 'Full keyboard accessibility with Tab, Enter, and arrow keys. Easily navigate entire platform without a mouse.'
        },
        {
            icon: Eye,
            title: 'Screen Reader Compatibility',
            description: 'Complete ARIA labeling and semantic HTML for screen readers like NVDA, JAWS, and VoiceOver.'
        },
        {
            icon: Zap,
            title: 'High Contrast Mode',
            description: 'Supports high contrast themes and respects system dark/light mode preferences for visual clarity.'
        },
        {
            icon: Smartphone,
            title: 'Mobile Accessible',
            description: 'Fully responsive design with touch-friendly buttons and scalable text for all device sizes.'
        },
        {
            icon: Volume2,
            title: 'Audio Descriptions',
            description: 'Video content includes captions and audio descriptions for deaf and hard of hearing users.'
        },
        {
            icon: Heart,
            title: 'Motor Accessibility',
            description: 'Large clickable areas, adjustable timeout settings, and drag-and-drop alternatives for motor impairments.'
        }
    ];

    const wcagStandards = [
        { level: 'A', color: 'emerald', description: 'Basic accessibility standards met for most users' },
        { level: 'AA', color: 'indigo', description: 'Enhanced standards for broader audience compatibility (Our Goal)' },
        { level: 'AAA', color: 'blue', description: 'Highest standards for specialized accessibility needs' }
    ];

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
                        <span className="text-white">Accessibility for</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 ml-3">Everyone</span>
                    </h1>
                    <p className="text-xl text-slate-300">
                        TalentAI is committed to ensuring our platform is accessible to all users, regardless of ability.
                    </p>
                </div>
            </section>

            {/* Commitment Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-8 md:p-12 animate-fade-in">
                        <h2 className="text-3xl font-black text-white mb-6">Our Accessibility Commitment</h2>
                        <p className="text-slate-300 leading-relaxed text-lg mb-6">
                            We believe technology should work for everyone. TalentAI is dedicated to creating an inclusive hiring platform that welcomes job seekers and employers of all abilities. We continuously work to meet and exceed WCAG 2.1 Level AA accessibility standards.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {wcagStandards.map((standard, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-lg border ${standard.color === 'emerald'
                                            ? 'border-emerald-500/30 bg-emerald-500/10'
                                            : standard.color === 'indigo'
                                                ? 'border-indigo-500/30 bg-indigo-500/10'
                                                : 'border-blue-500/30 bg-blue-500/10'
                                        }`}
                                >
                                    <p className={`font-bold text-lg mb-1 ${standard.color === 'emerald'
                                            ? 'text-emerald-300'
                                            : standard.color === 'indigo'
                                                ? 'text-indigo-300'
                                                : 'text-blue-300'
                                        }`}>WCAG {standard.level}</p>
                                    <p className="text-slate-300 text-sm">{standard.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-12 text-center animate-fade-in">
                        <h2 className="text-4xl font-black text-white mb-4">Accessibility Features</h2>
                        <p className="text-xl text-slate-300">Built-in features to ensure everyone can use TalentAI</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={idx}
                                    className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-8 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/20 animate-fade-in"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                                        <Icon className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-slate-300">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Keyboard Shortcuts */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black text-white mb-8 animate-fade-in">Keyboard Shortcuts</h2>
                    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-8 md:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { shortcut: 'Tab', action: 'Navigate forward through interactive elements' },
                                { shortcut: 'Shift + Tab', action: 'Navigate backward through interactive elements' },
                                { shortcut: 'Enter', action: 'Activate buttons, links, and form controls' },
                                { shortcut: 'Space', action: 'Activate buttons and checkboxes' },
                                { shortcut: 'Arrow Keys', action: 'Navigate through lists, menus, and options' },
                                { shortcut: 'Esc', action: 'Close modals and dropdowns' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="px-3 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 h-fit">
                                        <code className="text-indigo-300 font-bold">{item.shortcut}</code>
                                    </div>
                                    <p className="text-slate-300 pt-2">{item.action}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Ongoing Improvements */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-indigo-900/40 to-slate-900 backdrop-blur-xl p-8 md:p-12 animate-fade-in">
                        <h2 className="text-3xl font-black text-white mb-4">Continuous Improvement</h2>
                        <p className="text-slate-300 leading-relaxed mb-6">
                            Accessibility is an ongoing journey. We regularly test our platform with assistive technologies, conduct user testing with people with disabilities, and implement improvements based on feedback. Our development team follows accessibility best practices in every feature we build.
                        </p>
                        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                            <p className="text-slate-200 mb-3"><strong className="text-emerald-300">Recent Improvements:</strong></p>
                            <ul className="space-y-2 text-slate-300">
                                <li className="flex gap-2 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                                    <span>Added comprehensive ARIA labels to all interactive components</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                                    <span>Improved color contrast ratios throughout the platform (4.5:1 minimum)</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                                    <span>Implemented focus indicators for keyboard navigation</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                                    <span>Added skip links to main content sections</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl p-8 md:p-12 text-center animate-fade-in">
                        <MessageSquare className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-black text-white mb-4">Need Accessibility Assistance?</h2>
                        <p className="text-slate-300 text-lg mb-6">
                            If you experience any accessibility barriers or need accommodations, please don't hesitate to contact us. We're here to help.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="mailto:accessibility@talentai.com" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                                Email: accessibility@talentai.com
                            </a>
                            <a href="tel:+1-555-0100" className="inline-block px-8 py-3 rounded-xl border border-slate-700/50 bg-slate-800/50 text-slate-200 font-bold hover:bg-slate-700/50 transition-all">
                                Call: +1-555-0100
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Accessibility;
