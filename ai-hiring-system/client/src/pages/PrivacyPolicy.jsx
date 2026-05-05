const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-slate-200">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Privacy Policy</h1>
                <p className="text-slate-500 font-medium mb-12">Last updated: April 2026</p>

                <div className="space-y-8 text-slate-700 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us when you create an account, upload a resume, or interact with our AI matchmaking services. This includes your name, email, and professional history.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">2. How We Use Your Data</h2>
                        <p>Your resume data is processed through our Natural Language Processing (NLP) engine strictly for the purpose of matching you with relevant job opportunities. We do not sell your personal data to third-party advertisers.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">3. AI Processing & Transparency</h2>
                        <p>Our matchmaking algorithms analyze your skills and experience to generate an "AI Match Score." Employers use this score to rank applicants. You can view the skills extracted from your profile in your dashboard at any time.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
