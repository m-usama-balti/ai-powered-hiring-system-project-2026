const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="max-w-3xl mx-auto bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-10 md:p-16 rounded-3xl shadow-xl relative z-10">
                <h1 className="text-5xl font-black text-white mb-2">Privacy Policy</h1>
                <p className="text-slate-400 font-medium mb-12">Last updated: April 2026</p>

                <div className="space-y-8 text-slate-300 leading-relaxed text-lg">
                    <section className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-3">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us when you create an account, upload a resume, or interact with our AI matchmaking services. This includes your name, email, and professional history.</p>
                    </section>

                    <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <h2 className="text-2xl font-bold text-white mb-3">2. How We Use Your Data</h2>
                        <p>Your resume data is processed through our Natural Language Processing (NLP) engine strictly for the purpose of matching you with relevant job opportunities. We do not sell your personal data to third-party advertisers.</p>
                    </section>

                    <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <h2 className="text-2xl font-bold text-white mb-3">3. AI Processing & Transparency</h2>
                        <p>Our matchmaking algorithms analyze your skills and experience to generate an "AI Match Score." Employers use this score to rank applicants. You can view the skills extracted from your profile in your dashboard at any time.</p>
                    </section>

                    <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                        <h2 className="text-2xl font-bold text-white mb-3">4. Data Security</h2>
                        <p>We employ industry-standard encryption and security measures to protect your personal data. All data is stored securely and accessed only by authorized personnel.</p>
                    </section>

                    <section className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                        <h2 className="text-2xl font-bold text-white mb-3">5. Your Rights</h2>
                        <p>You have the right to access, modify, or delete your personal data at any time. Contact us at privacy@talentai.com for any data-related requests.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
