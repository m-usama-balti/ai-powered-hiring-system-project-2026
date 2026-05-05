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
        <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Top Companies Hiring on TalentAI</h1>
                    <p className="text-xl text-slate-500">Join the world's most innovative teams using AI to find talent.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <div className="bg-slate-100 p-4 rounded-full mb-4">
                                <Building2 className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-1">{company.name}</h3>
                            <p className="text-sm font-medium text-indigo-600 mb-4">{company.industry}</p>

                            <div className="mt-auto w-full border-t border-slate-100 pt-6 flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-500">{company.rolesOpen} open roles</span>
                                <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1 text-sm">
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
