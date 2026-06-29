const MailIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
    </svg>
);

const PhoneIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.4 19.4 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const MapPinIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M12 21s6-5.4 6-11a6 6 0 0 0-12 0c0 5.6 6 11 6 11z" />
        <circle cx="12" cy="10" r="2" />
    </svg>
);

const GraduationCapIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="m22 10-10-5L2 10l10 5 10-5Z" />
        <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
    </svg>
);

const CodeIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="m8 9-4 3 4 3" />
        <path d="m16 9 4 3-4 3" />
        <path d="m14 5-4 14" />
    </svg>
);

const UsersIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const About = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <section className="border-b border-slate-700/50 bg-slate-900/50 pb-16 pt-24 relative z-10">
                <div className="mx-auto max-w-4xl space-y-6 px-4 text-center animate-fade-in">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 10-10-5L2 10l10 5 10-5Z" /><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" /></svg>
                        <span>Final Year Project (2022-2026)</span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black leading-tight">
                        <span className="text-white">About The</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 ml-2">AI Hiring System</span>
                    </h1>
                    <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-300">
                        Developed as a comprehensive Software Requirements Specification (SRS) implementation, this platform revolutionizes the recruitment process through artificial intelligence, automated resume parsing, and intelligent job-candidate matching.
                    </p>
                </div>
            </section>

            <section className="px-4 py-16 relative z-10">
                <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2 animate-fade-in">
                    <div className="space-y-6">
                        <h2 className="text-4xl font-black text-white">Our Mission</h2>
                        <p className="text-lg leading-relaxed text-slate-300">
                            Traditional recruitment is bogged down by manual resume screening, leading to inefficiencies and human bias. Our mission was to build a microservices-based platform that leverages Natural Language Processing (NLP) to objectively score and rank candidates based purely on merit and skill alignment.
                        </p>
                        <div className="flex items-center gap-3 font-medium text-slate-300">
                            <div className="rounded-lg bg-indigo-500/20 border border-indigo-500/30 p-2 text-indigo-400"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 9-4 3 4 3" /><path d="m16 9 4 3-4 3" /><path d="m14 5-4 14" /></svg></div>
                            <span>Powered by MERN Stack & Python FastAPI</span>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-slate-700/50 p-8 text-white shadow-xl backdrop-blur-xl">
                        <h3 className="mb-6 border-b border-slate-700/50 pb-4 text-xl font-bold text-indigo-400">Academic Details</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center justify-between gap-4">
                                <span className="text-slate-400">Department</span>
                                <span className="text-right font-semibold text-white">Computer Science</span>
                            </li>
                            <li className="flex items-center justify-between gap-4">
                                <span className="text-slate-400">Institution</span>
                                <span className="text-right font-semibold text-white">FUUAST</span>
                            </li>
                            <li className="flex items-center justify-between gap-4">
                                <span className="text-slate-400">Location</span>
                                <span className="text-right font-semibold text-white">Islamabad, Pakistan</span>
                            </li>
                            <li className="flex items-center justify-between gap-4">
                                <span className="text-slate-400">Session</span>
                                <span className="text-right font-semibold text-white">2022 - 2026</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="border-y border-slate-700/50 bg-slate-900/50 px-4 py-16 relative z-10">
                <div className="mx-auto max-w-4xl">
                    <h2 className="mb-12 text-center text-4xl font-black text-white animate-fade-in">Tech Stack</h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-8 animate-fade-in">
                            <h3 className="mb-4 text-2xl font-bold text-indigo-400">Frontend</h3>
                            <ul className="space-y-2 text-slate-300">
                                <li>• React.js with React Router</li>
                                <li>• Tailwind CSS for styling</li>
                                <li>• Lucide React Icons</li>
                                <li>• Context API for state management</li>
                            </ul>
                        </div>
                        <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
                            <h3 className="mb-4 text-2xl font-bold text-emerald-400">Backend</h3>
                            <ul className="space-y-2 text-slate-300">
                                <li>• Node.js & Express.js</li>
                                <li>• MongoDB database</li>
                                <li>• Python FastAPI for AI service</li>
                                <li>• spaCy & NLTK for NLP</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
<div className="mx-auto max-w-4xl space-y-6 px-4 text-center">
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
        <GraduationCapIcon className="h-4 w-4" />
        <span>Final Year Project (2022-2026)</span>
    </div>
    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
        About The <span className="text-indigo-600">AI Hiring System</span>
    </h1>
    <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-600">
        Developed as a comprehensive Software Requirements Specification (SRS) implementation, this platform revolutionizes the recruitment process through artificial intelligence, automated resume parsing, and intelligent job-candidate matching.
    </p>
</div>
            </section >

            <section className="px-4 py-16">
                <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
                        <p className="text-lg leading-relaxed text-slate-600">
                            Traditional recruitment is bogged down by manual resume screening, leading to inefficiencies and human bias. Our mission was to build a microservices-based platform that leverages Natural Language Processing (NLP) to objectively score and rank candidates based purely on merit and skill alignment.
                        </p>
                        <div className="flex items-center gap-3 font-medium text-slate-700">
                            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600"><CodeIcon className="h-5 w-5" /></div>
                            <span>Powered by MERN Stack & Python FastAPI</span>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-indigo-900 p-8 text-white shadow-xl">
                        <h3 className="mb-6 border-b border-indigo-700 pb-4 text-xl font-bold text-indigo-100">Academic Details</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center justify-between gap-4">
                                <span className="text-indigo-300">Department</span>
                                <span className="text-right font-semibold">Computer Science</span>
                            </li>
                            <li className="flex items-center justify-between gap-4">
                                <span className="text-indigo-300">Institution</span>
                                <span className="text-right font-semibold">FUUAST</span>
                            </li>
                            <li className="flex items-center justify-between gap-4">
                                <span className="text-indigo-300">Location</span>
                                <span className="text-right font-semibold">Islamabad, Pakistan</span>
                            </li>
                            <li className="flex items-center justify-between gap-4">
                                <span className="text-indigo-300">Session</span>
                                <span className="text-right font-semibold">2022 - 2026</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="border-y border-slate-200 bg-white px-4 py-16">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900">The Development Team</h2>
                        <p className="mx-auto max-w-2xl text-slate-600">The architects and engineers behind the AI Matchmaking algorithm and scalable web architecture.</p>
                    </div>

                    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center transition-shadow hover:shadow-md">
                            <div className="absolute left-0 top-0 h-1 w-full bg-indigo-600"></div>
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-black text-indigo-700 shadow-sm">
                                MU
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">Muhammad Usama</h3>
                            <p className="mb-2 font-semibold text-indigo-600">BSCS-2022-37326</p>
                            <p className="text-sm text-slate-500">Lead Developer & Systems Architect</p>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center transition-shadow hover:shadow-md">
                            <div className="absolute left-0 top-0 h-1 w-full bg-indigo-600"></div>
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-black text-indigo-700 shadow-sm">
                                SQ
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">Syed Qamar Abbas</h3>
                            <p className="mb-2 font-semibold text-indigo-600">BSCS-2022-37392</p>
                            <p className="text-sm text-slate-500">Lead Developer & AI Integration</p>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <h3 className="mb-8 flex items-center justify-center gap-2 text-xl font-bold text-slate-900">
                            <UsersIcon className="h-6 w-6 text-indigo-600" /> Under the Supervision of
                        </h3>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                            <div>
                                <p className="text-lg font-bold text-slate-800">Ma'am Sabeen</p>
                                <p className="text-sm font-medium text-slate-500">Project Supervisor</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-800">Sir Naeem Malik</p>
                                <p className="text-sm font-medium text-slate-500">Project Coordinator</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-20">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
                    <div className="grid grid-cols-1 lg:grid-cols-5">
                        <div className="relative flex flex-col justify-center overflow-hidden bg-slate-900 p-10 text-white lg:col-span-2">
                            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 transform rounded-full bg-indigo-600 opacity-20 blur-3xl"></div>

                            <h2 className="relative z-10 mb-4 text-3xl font-bold">Get In Touch</h2>
                            <p className="relative z-10 mb-10 leading-relaxed text-slate-300">
                                Have questions about the AI matching algorithm, our methodology, or want to view the full source code? Reach out to the development team.
                            </p>

                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-4 text-slate-300 transition-colors hover:text-white">
                                    <div className="rounded-lg bg-slate-800 p-3"><MapPinIcon className="h-5 w-5 text-indigo-400" /></div>
                                    <span className="font-medium">FUUAST, Islamabad, Pakistan</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-300 transition-colors hover:text-white">
                                    <div className="rounded-lg bg-slate-800 p-3"><MailIcon className="h-5 w-5 text-indigo-400" /></div>
                                    <span className="font-medium">contact@aihiring.edu.pk</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-300 transition-colors hover:text-white">
                                    <div className="rounded-lg bg-slate-800 p-3"><PhoneIcon className="h-5 w-5 text-indigo-400" /></div>
                                    <span className="font-medium">+92 (000) 000-0000</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 lg:col-span-3 lg:p-14">
                            <h3 className="mb-6 text-2xl font-bold text-slate-900">Send a Message</h3>
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">First Name</label>
                                        <input type="text" className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600" placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">Last Name</label>
                                        <input type="text" className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600" placeholder="Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
                                    <input type="email" className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Message</label>
                                    <textarea rows="4" className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600" placeholder="How can we help you?"></textarea>
                                </div>
                                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3.5 font-bold text-white shadow-md transition-colors hover:bg-indigo-700">
                                    Send Message <MailIcon className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div >
    );
};

export default About;
