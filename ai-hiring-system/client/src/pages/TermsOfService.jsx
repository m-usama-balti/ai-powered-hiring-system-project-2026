const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-slate-200">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Terms of Service</h1>
                <p className="text-slate-500 font-medium mb-12">Last updated: April 2026</p>

                <div className="space-y-8 text-slate-700 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
                        <p>By accessing and using TalentAI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">2. Employer Obligations</h2>
                        <p>Employers agree to post accurate job descriptions and use our AI matching tools in accordance with equal employment opportunity laws. Misuse of the platform to scrape candidate data is strictly prohibited.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Job Seeker Accounts</h2>
                        <p>You are responsible for maintaining the confidentiality of your account credentials. The information you upload to your profile must be truthful and accurate to ensure our AI matchmaking functions correctly.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
