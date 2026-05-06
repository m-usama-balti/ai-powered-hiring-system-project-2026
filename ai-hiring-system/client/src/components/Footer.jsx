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

    // 1. Define the dashboard routes where the footer should be hidden
    const hiddenRoutes = ['/seeker', '/recruiter', '/admin'];

    // 2. Check if the current URL starts with any of these routes
    const isDashboard = hiddenRoutes.some(route => location.pathname.startsWith(route));

    // 3. If it is a dashboard, return null (renders nothing)
    if (isDashboard) {
        return null;
    }

    return (
        <footer className="border-t border-border bg-secondary/30">
            <div className="container mx-auto px-4 py-12">
                <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="rounded-lg bg-primary p-2">
                                <BriefcaseIcon className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold">TalentAI</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            AI-powered hiring platform connecting talent with opportunity.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="rounded-lg bg-background p-2 transition-smooth hover:bg-primary hover:text-primary-foreground">
                                <LinkedinIcon className="h-4 w-4" />
                            </a>
                            <a href="#" className="rounded-lg bg-background p-2 transition-smooth hover:bg-primary hover:text-primary-foreground">
                                <TwitterIcon className="h-4 w-4" />
                            </a>
                            <a href="#" className="rounded-lg bg-background p-2 transition-smooth hover:bg-primary hover:text-primary-foreground">
                                <GithubIcon className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">For Job Seekers</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/jobs" className="transition-smooth hover:text-foreground">Browse Jobs</Link></li>
                            <li><Link to="/companies" className="transition-smooth hover:text-foreground">Companies</Link></li>
                            <li><Link to="/career-advice" className="transition-smooth hover:text-foreground">Career Advice</Link></li>
                            <li><Link to="/resume-builder" className="transition-smooth hover:text-foreground">Resume Builder</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">For Employers</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/employers" className="transition-smooth hover:text-foreground">Employer Overview</Link></li>
                            <li><Link to="/pricing" className="transition-smooth hover:text-foreground">Pricing</Link></li>
                            <li><Link to="/contact" className="transition-smooth hover:text-foreground">Contact Sales</Link></li>
                            <li><Link to="/register" className="transition-smooth hover:text-foreground">Post a Job</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/about" className="transition-smooth hover:text-foreground">About Us</Link></li>
                            <li><Link to="/contact" className="transition-smooth hover:text-foreground">Contact</Link></li>
                            <li><Link to="/privacy" className="transition-smooth hover:text-foreground">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="transition-smooth hover:text-foreground">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} TalentAI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
