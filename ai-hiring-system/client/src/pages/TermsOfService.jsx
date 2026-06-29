const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="max-w-3xl mx-auto bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-10 md:p-16 rounded-3xl shadow-xl relative z-10">
                <h1 className="text-5xl font-black text-white mb-2">Terms of Service</h1>
                <p className="text-slate-400 font-medium mb-12">Last updated: April 2026</p>

                <div className="space-y-8 text-slate-300 leading-relaxed text-lg">
                    <section className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                        <p>By accessing and using TalentAI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
                    </section>

                    <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <h2 className="text-2xl font-bold text-white mb-3">2. Employer Obligations</h2>
                        <p>Employers agree to post accurate job descriptions and use our AI matching tools in accordance with equal employment opportunity laws. Misuse of the platform to scrape candidate data is strictly prohibited.</p>
                    </section>

                    <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <h2 className="text-2xl font-bold text-white mb-3">3. Job Seeker Accounts</h2>
                        <p>Job seekers must provide accurate resume information. Fraudulent applications or fake profiles will result in immediate account termination without refund.</p>
                    </section>

                    <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                        <h2 className="text-2xl font-bold text-white mb-3">4. Intellectual Property</h2>
                        <p>All content on TalentAI, including our AI algorithms, matching engine, and user interface, is protected by copyright and intellectual property laws.</p>
                    </section>

                    <section className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                        <h2 className="text-2xl font-bold text-white mb-3">5. Limitation of Liability</h2>
                        <p>TalentAI is provided on an "as-is" basis. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
