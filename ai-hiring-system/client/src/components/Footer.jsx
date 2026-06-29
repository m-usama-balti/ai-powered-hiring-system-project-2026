import { Link, useLocation } from 'react-router-dom';

const BriefcaseIcon = ({ className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 12h.01" />
        <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <path d="M22 13v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3" />
        <path d="M18 6H6a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z" />
    </svg>
);

const LinkedinIcon = ({ className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const TwitterIcon = ({ className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.4 3.3 4.4s-1.4 1.4-3.3 1.4H6.7c-1.5 0-3.3-1.4-3.3-1.4s1.7-3 3.3-4.4C5.4 6.1 4.7 4 4.7 4s2.1 1.4 4.6 2.8c0 0 3.3-2.8 6.7-2.8z" />
    </svg>
);

const GithubIcon = ({ className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
);

const Footer = () => {
    const location = useLocation();
    const hiddenRoutes = ['/seeker', '/recruiter', '/admin'];
    const isDashboard = hiddenRoutes.some(route => location.pathname.startsWith(route));

    if (isDashboard) {
        return null;
    }

    const FooterSection = ({ title, links }) => (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
            <ul className="space-y-2">
                {links.map(({ label, href }) => (
                    <li key={label}>
                        <Link to={href} className="text-sm text-slate-400 transition-smooth hover:text-indigo-400">
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );

    const SocialLink = ({ Icon, href }) => (
        <a href={href} className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 transition-smooth hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:text-indigo-400">
            <Icon className="h-5 w-5" />
        </a>
    );

    return (
        <footer className="relative border-t border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-600/5 blur-3xl"></div>
            </div>

            <div className="relative container-wide py-16 sm:py-20">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 gap-12 md:grid-cols-5 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-6 md:col-span-1">
                        <Link to="/" className="inline-flex items-center gap-2 group">
                            <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 p-2 text-white shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-smooth">
                                <BriefcaseIcon className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                                TalentAI
                            </span>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            AI-powered hiring platform connecting top talent with exceptional opportunities worldwide.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <SocialLink Icon={LinkedinIcon} href="#" />
                            <SocialLink Icon={TwitterIcon} href="#" />
                            <SocialLink Icon={GithubIcon} href="#" />
                        </div>
                    </div>

                    {/* Links Columns */}
                    <FooterSection title="For Job Seekers" links={[
                        { label: 'Browse Jobs', href: '/jobs' },
                        { label: 'Companies', href: '/companies' },
                        { label: 'Career Advice', href: '/career-advice' },
                        { label: 'Resume Builder', href: '/resume-builder' }
                    ]} />

                    <FooterSection title="For Employers" links={[
                        { label: 'Employer Overview', href: '/employers' },
                        { label: 'Pricing', href: '/pricing' },
                        { label: 'Contact Sales', href: '/contact' },
                        { label: 'Post a Job', href: '/register' }
                    ]} />

                    <FooterSection title="Company" links={[
                        { label: 'About Us', href: '/about' },
                        { label: 'Contact', href: '/contact' },
                        { label: 'Blog', href: '/blog' },
                        { label: 'Careers', href: '/careers' }
                    ]} />

                    <FooterSection title="Legal" links={[
                        { label: 'Privacy Policy', href: '/privacy' },
                        { label: 'Terms of Service', href: '/terms' },
                        { label: 'Cookie Policy', href: '/cookie-policy' },
                        { label: 'Accessibility', href: '/accessibility' }
                    ]} />
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700/50 my-8"></div>

                {/* Bottom Footer */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-400">
                        &copy; {new Date().getFullYear()} TalentAI. All rights reserved.
                    </p>
                    <p className="text-sm text-slate-400">
                        Built with <span className="text-emerald-400">AI Intelligence</span> for modern hiring
                    </p>
                    <div className="flex gap-4 text-xs text-slate-500">
                        <a href="#" className="hover:text-slate-300 transition-colors">Status</a>
                        <span className="text-slate-700">•</span>
                        <a href="#" className="hover:text-slate-300 transition-colors">Changelog</a>
                        <span className="text-slate-700">•</span>
                        <a href="#" className="hover:text-slate-300 transition-colors">Feedback</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
