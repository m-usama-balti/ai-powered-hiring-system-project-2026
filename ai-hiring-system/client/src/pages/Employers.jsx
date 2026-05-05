import { Link } from 'react-router-dom';

const Building2Icon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 21V7h10v14" />
    <path d="M9 7V5h6v2" />
    <path d="M12 9v2" />
    <path d="M9 11h.01" />
    <path d="M15 11h.01" />
    <path d="M9 15h.01" />
    <path d="M15 15h.01" />
  </svg>
);

const UsersIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TargetIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ZapIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
);

const AwardIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const features = [
  {
    icon: UsersIcon,
    title: 'Access Top Talent',
    description: 'Connect with 50,000+ qualified candidates across all industries and skill levels.'
  },
  {
    icon: TargetIcon,
    title: 'AI-Powered Matching',
    description: 'Our intelligent algorithms find the perfect candidates for your open positions.'
  },
  {
    icon: ZapIcon,
    title: 'Faster Hiring',
    description: 'Reduce time-to-hire by 60% with automated screening and smart recommendations.'
  },
  {
    icon: AwardIcon,
    title: 'Quality Candidates',
    description: 'All candidates are verified and pre-screened to ensure the highest quality matches.'
  }
];

const stats = [
  { value: '10k+', label: 'Active Candidates' },
  { value: '500+', label: 'Companies Hiring' },
  { value: '60%', label: 'Faster Hiring' },
  { value: '98%', label: 'Satisfaction Rate' }
];

const Employers = () => {
  return (
    <div className="min-h-screen bg-white pb-20">
      <section className="bg-linear-to-br from-indigo-50 via-white to-slate-50 pb-20 pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-800">
              <Building2Icon className="h-4 w-4" />
              <span>For Employers</span>
            </div>

            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
              Hire the Best Talent <br />
              <span className="text-indigo-600">With AI Precision</span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-slate-600">
              Join 500+ companies using our AI Hiring System to find, engage, and hire top talent faster than ever before.
            </p>

            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <Link to="/register" className="rounded-lg bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-md transition-all hover:bg-indigo-700">
                Post a Job Free
              </Link>
              <Link to="/about" className="rounded-lg border border-slate-300 bg-white px-8 py-4 text-lg font-bold text-slate-700 transition-all hover:bg-slate-50">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 text-4xl font-extrabold text-indigo-600 md:text-5xl">
                  {stat.value}
                </div>
                <div className="text-sm font-medium uppercase tracking-wide text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              Why Top Companies Choose Us
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to build your dream team without the manual screening process.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100">
                    <Icon className="h-7 w-7 text-indigo-600" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">{feature.title}</h3>
                  <p className="leading-relaxed text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600">
              Choose the plan that works best for your hiring needs
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {[
              { name: 'Starter', price: '$299', jobs: '5', features: ['AI Matching', 'Basic Analytics', 'Email Support'] },
              { name: 'Professional', price: '$599', jobs: '15', features: ['Everything in Starter', 'Advanced Analytics', 'Priority Support', 'Custom Branding'], popular: true },
              { name: 'Enterprise', price: 'Custom', jobs: 'Unlimited', features: ['Everything in Pro', 'Dedicated Account Manager', 'API Access', 'Custom Integration'] }
            ].map((plan, index) => (
              <div key={index} className={`relative rounded-2xl bg-white p-8 text-center transition-all hover:-translate-y-1 ${plan.popular ? 'border-2 border-indigo-600 shadow-xl' : 'border border-slate-200 shadow-sm'}`}>
                {plan.popular && (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 transform">
                    <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="mb-2 text-2xl font-bold text-slate-900">{plan.name}</h3>
                <div className="mb-2 text-4xl font-extrabold text-indigo-600">{plan.price}</div>
                <div className="mb-6 text-sm text-slate-500">per month</div>
                <div className="mb-6 border-b border-slate-100 pb-6 text-sm font-semibold text-slate-800">{plan.jobs} Job Posts</div>

                <ul className="mb-8 space-y-4 text-left">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                        <div className="h-2 w-2 rounded-full bg-indigo-600" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to="/register" className={`block w-full rounded-lg py-3 font-bold transition-colors ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-indigo-900 p-12 text-center shadow-xl md:p-16">
            <div className="mx-auto max-w-3xl space-y-8">
              <h2 className="text-4xl font-extrabold text-white md:text-5xl">
                Ready to Build Your Dream Team?
              </h2>
              <p className="text-xl text-indigo-200">
                Start hiring top talent today with our AI-powered platform.
              </p>
              <Link to="/register" className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-bold text-indigo-900 shadow-md transition-colors hover:bg-indigo-50">
                Post Your First Job Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Employers;
