import { FileText, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResumeBuilder = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Split Landing Layout */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-24 px-4 sm:px-6 lg:px-8">

                {/* Left Side: Copy */}
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm mb-6 border border-indigo-100">
                        <Sparkles className="h-4 w-4" /> Powered by spaCy NLP
                    </div>
                    <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                        Turn your PDF into an <span className="text-indigo-600">AI-Optimized Profile</span>.
                    </h1>
                    <p className="text-xl text-slate-500 mb-8 leading-relaxed">
                        Stop manually typing out your work history. Our Resume Intelligence engine extracts your technical skills, experience, and certifications instantly, formatting them perfectly for our AI matchmaking algorithms.
                    </p>

                    <ul className="space-y-4 mb-10">
                        {['Identifies missing skill gaps', 'Extracts 5,000+ technical keywords', 'Generates an Employability Score'].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-700 font-medium text-lg">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500" /> {feature}
                            </li>
                        ))}
                    </ul>

                    <Link to="/login" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-md transition-all">
                        Try the Resume Engine <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>

                {/* Right Side: Visual Graphic */}
                <div className="bg-slate-50 rounded-3xl p-8 lg:p-12 border border-slate-200 shadow-inner relative">
                    <div className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3 animate-bounce">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                            <p className="font-bold text-slate-900">Skills Extracted</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center justify-center h-80 text-center">
                        <FileText className="h-20 w-20 text-indigo-200 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">Upload your Resume.pdf</h3>
                        <p className="text-slate-500 mt-2">The AI handles the rest.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResumeBuilder;
