import { Briefcase, MapPin, DollarSign, Users, Heart, Zap, Globe, Coffee, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Careers = () => {
    const benefits = [
        { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health insurance, gym membership, and mental health support' },
        { icon: Zap, title: 'Professional Growth', description: 'Learning budget, conferences, and certification programs' },
        { icon: Globe, title: 'Remote-First Culture', description: 'Work from anywhere with flexible hours and distributed teams' },
        { icon: Coffee, title: 'Awesome Perks', description: 'Unlimited coffee, home office setup, and team retreats' }
    ];

    const openPositions = [
        {
            id: 1,
            title: 'Frontend Developer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            salary: '$120k - $160k'
        },
        {
            id: 2,
            title: 'Backend Engineer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            salary: '$130k - $170k'
        },
        {
            id: 3,
            title: 'AI/ML Engineer',
            department: 'AI Team',
            location: 'Remote',
            type: 'Full-time',
            salary: '$150k - $200k'
        },
        {
            id: 4,
            title: 'UI/UX Designer',
            department: 'Design',
            location: 'Remote',
            type: 'Full-time',
            salary: '$100k - $140k'
        },
        {
            id: 5,
            title: 'Product Manager',
            department: 'Product',
            location: 'Remote',
            type: 'Full-time',
            salary: '$120k - $160k'
        },
        {
            id: 6,
            title: 'HR Specialist',
            department: 'People',
            location: 'Remote',
            type: 'Full-time',
            salary: '$80k - $120k'
        }
    ];

    const teamMembers = [
        { name: 'Priya Kapoor', role: 'CEO & Founder', image: '👩‍💼' },
        { name: 'James Wilson', role: 'CTO', image: '👨‍💻' },
        { name: 'Maya Patel', role: 'Head of AI', image: '👩‍🔬' },
        { name: 'Alex Chen', role: 'Design Lead', image: '👨‍🎨' }
    ];

    const hiringProcess = [
        { step: 1, title: 'Application', description: 'Submit your resume and brief introduction' },
        { step: 2, title: 'Phone Screen', description: '30-minute call with recruiter' },
        { step: 3, title: 'Technical/Design', description: 'Assessment relevant to role' },
        { step: 4, title: 'Team Interview', description: 'Meet with team members' },
        { step: 5, title: 'Offer', description: 'Receive final offer' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            {/* Hero Section */}
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center animate-fade-in">
                    <h1 className="text-6xl font-black mb-4">
                        <span className="text-white">Join Our</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 ml-3">Mission</span>
                    </h1>
                    <p className="text-xl text-slate-300">
                        Help us revolutionize hiring and build a platform that empowers people to find their dream careers.
                    </p>
                </div>
            </section>

            {/* Culture Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-8 md:p-12 animate-fade-in">
                        <h2 className="text-3xl font-black text-white mb-6">Our Culture</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-emerald-400">We Believe In</h3>
                                <ul className="space-y-3 text-slate-300">
                                    <li className="flex gap-3 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                                        <span>Building products that have real impact on people's lives</span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                                        <span>Transparency and open communication across all levels</span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                                        <span>Continuous learning and personal development</span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                                        <span>Diversity, equity, and inclusion in everything we do</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-indigo-400">Why Work With Us</h3>
                                <ul className="space-y-3 text-slate-300">
                                    <li className="flex gap-3 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                                        <span>Collaborate with world-class engineers and designers</span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                                        <span>Work on cutting-edge AI and machine learning technologies</span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                                        <span>Competitive compensation and equity packages</span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                                        <span>100% remote work with no location restrictions</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-black text-white mb-8 text-center animate-fade-in">Benefits & Perks</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, idx) => {
                            const Icon = benefit.icon;
                            return (
                                <div
                                    key={idx}
                                    className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/20 animate-fade-in"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                                        <Icon className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <h3 className="font-bold text-white mb-2">{benefit.title}</h3>
                                    <p className="text-sm text-slate-400">{benefit.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Hiring Process */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black text-white mb-8 text-center animate-fade-in">Our Hiring Process</h2>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {hiringProcess.map((item, idx) => (
                            <div key={idx} className="relative animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                                {idx < hiringProcess.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-[calc(50%+24px)] right-0 h-1 bg-gradient-to-r from-indigo-500 to-transparent"></div>
                                )}
                                <div className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-6 text-center relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold mx-auto mb-3">
                                        {item.step}
                                    </div>
                                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-black text-white mb-8 animate-fade-in">Open Positions</h2>
                    <div className="space-y-4">
                        {openPositions.map((position, idx) => (
                            <div
                                key={position.id}
                                className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/20 animate-fade-in"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2">{position.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Briefcase className="h-4 w-4" />
                                                {position.department}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {position.location}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                {position.salary}
                                            </div>
                                            <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300">{position.type}</span>
                                        </div>
                                    </div>
                                    <button className="px-6 py-2.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold hover:bg-indigo-500/30 transition-all flex items-center gap-2">
                                        Apply Now
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Showcase */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black text-white mb-8 text-center animate-fade-in">Meet Our Leadership</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teamMembers.map((member, idx) => (
                            <div
                                key={idx}
                                className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-6 text-center hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/20 animate-fade-in"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="text-6xl mb-4">{member.image}</div>
                                <h3 className="font-bold text-white mb-1">{member.name}</h3>
                                <p className="text-sm text-indigo-400">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 to-slate-900 backdrop-blur-xl p-12 text-center animate-fade-in">
                        <Users className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                        <h2 className="text-4xl font-black text-white mb-4">Ready to Make an Impact?</h2>
                        <p className="text-lg text-slate-300 mb-8">
                            Join our team and help us build the future of hiring and talent matching.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/careers" className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                                Explore Open Roles
                            </Link>
                            <a href="mailto:careers@talentai.com" className="px-8 py-3 rounded-xl border border-slate-700/50 bg-slate-800/50 text-slate-200 font-bold hover:bg-slate-700/50 transition-all">
                                Email Careers Team
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Careers;
