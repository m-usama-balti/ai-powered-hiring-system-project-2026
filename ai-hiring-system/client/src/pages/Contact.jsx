import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10 rounded-3xl border border-slate-700/50 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Left Side: Info */}
                    <div className="bg-gradient-to-br from-indigo-900/80 to-slate-900 p-10 md:p-16 text-white flex flex-col justify-between backdrop-blur-xl">
                        <div>
                            <h2 className="text-4xl font-black mb-4">
                                <span className="text-white">Get in</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 ml-2">touch</span>
                            </h2>
                            <p className="text-slate-300 text-lg mb-12">Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.</p>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-500/20 border border-indigo-500/30 p-3 rounded-full"><Mail className="h-6 w-6 text-indigo-400" /></div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">Email</p>
                                        <span className="font-medium text-lg">support@talentai.com</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-emerald-500/20 border border-emerald-500/30 p-3 rounded-full"><Phone className="h-6 w-6 text-emerald-400" /></div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">Phone</p>
                                        <span className="font-medium text-lg">+92 300 1234567</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-500/20 border border-blue-500/30 p-3 rounded-full"><MapPin className="h-6 w-6 text-blue-400" /></div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">Location</p>
                                        <span className="font-medium text-lg">Islamabad, Pakistan</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="bg-slate-900/50 p-10 md:p-16 backdrop-blur-xl">
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Message sent!"); }}>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
                                <input type="text" required className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-slate-100 placeholder-slate-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
                                <input type="email" required className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-slate-100 placeholder-slate-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="john@company.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">How can we help?</label>
                                <textarea rows="4" required className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-slate-100 placeholder-slate-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none" placeholder="Tell us about your project or issue..."></textarea>
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-emerald-500 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/50 transition-smooth hover:-translate-y-0.5 flex justify-center items-center gap-2">
                                Send Message <Send className="h-5 w-5" />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Contact;
