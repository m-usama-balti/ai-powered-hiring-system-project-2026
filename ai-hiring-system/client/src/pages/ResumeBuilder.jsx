import { FileText, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResumeBuilder = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            {/* Split Landing Layout */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-24 px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Left Side: Copy */}
                <div className="animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-sm mb-6 border border-indigo-500/30">
                        <Sparkles className="h-4 w-4" /> Powered by spaCy NLP
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6">
                        <span className="text-white">Turn your PDF into an</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 ml-2">AI-Optimized Profile</span>
                    </h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Stop manually typing out your work history. Our Resume Intelligence engine extracts your technical skills, experience, and certifications instantly, formatting them perfectly for our AI matchmaking algorithms.
                    </p>

                    <ul className="space-y-4 mb-10">
                        {['Identifies missing skill gaps', 'Extracts 5,000+ technical keywords', 'Generates an Employability Score'].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-300 font-medium text-lg">
                                <CheckCircle2 className="h-6 w-6 text-emerald-400" /> {feature}
                            </li>
                        ))}
                    </ul>

                    <Link to="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-smooth hover:-translate-y-0.5">
                        Try the Resume Engine <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>

                {/* Right Side: Visual Graphic */}
                <div className="relative animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <div className="rounded-3xl p-8 lg:p-12 border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl relative">
                        <div className="absolute -top-6 -left-6 bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl shadow-lg border border-slate-700/50 flex items-center gap-3 animate-bounce">
                            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                                <p className="font-bold text-white">Skills Extracted</p>
                            </div>
                        </div>

                        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30 flex flex-col items-center justify-center h-80 text-center">
                            <FileText className="h-20 w-20 text-indigo-500/30 mb-4" />
                            <h3 className="text-xl font-bold text-white">Upload your Resume.pdf</h3>
                            <p className="text-slate-400 mt-2">The AI handles the rest.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResumeBuilder;
