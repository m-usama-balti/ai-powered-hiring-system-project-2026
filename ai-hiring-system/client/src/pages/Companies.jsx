import { Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Companies = () => {
    const companies = [
        { name: "TechNova", industry: "Cloud Computing", rolesOpen: 12 },
        { name: "DataSync Inc.", industry: "Data Analytics", rolesOpen: 8 },
        { name: "AI Core", industry: "Artificial Intelligence", rolesOpen: 24 },
        { name: "CyberShield", industry: "Cybersecurity", rolesOpen: 5 },
        { name: "GlobalSystems", industry: "Enterprise Software", rolesOpen: 15 },
        { name: "NextGen Web", industry: "E-Commerce", rolesOpen: 3 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-4">
                        <span className="text-white">Top Companies Hiring on</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 ml-2">TalentAI</span>
                    </h1>
                    <p className="text-xl text-slate-300">Join the world's most innovative teams using AI to find talent.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company, idx) => (
                        <div
                            key={idx}
                            className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-8 flex flex-col items-center text-center hover:border-indigo-500/50 transition-smooth hover:shadow-xl hover:shadow-indigo-500/20 animate-fade-in"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="bg-indigo-500/20 border border-indigo-500/30 p-4 rounded-full mb-4">
                                <Building2 className="h-10 w-10 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">{company.name}</h3>
                            <p className="text-sm font-medium text-emerald-400 mb-4">{company.industry}</p>

                            <div className="mt-auto w-full border-t border-slate-700/50 pt-6 flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-400">{company.rolesOpen} open roles</span>
                                <Link to="/login" className="text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1 text-sm transition-colors">
                                    View Jobs <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Companies;
