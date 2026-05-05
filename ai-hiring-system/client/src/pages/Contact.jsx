import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Left Side: Info */}
                    <div className="bg-indigo-900 p-10 md:p-16 text-white flex flex-col justify-between">
                        <div>
                            <h2 className="text-3xl font-extrabold mb-4">Get in touch</h2>
                            <p className="text-indigo-200 text-lg mb-12">Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.</p>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-800 p-3 rounded-full"><Mail className="h-6 w-6 text-indigo-300" /></div>
                                    <span className="font-medium text-lg">support@talentai.com</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-800 p-3 rounded-full"><Phone className="h-6 w-6 text-indigo-300" /></div>
                                    <span className="font-medium text-lg">+92 300 1234567</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-800 p-3 rounded-full"><MapPin className="h-6 w-6 text-indigo-300" /></div>
                                    <span className="font-medium text-lg">Islamabad, Pakistan</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="p-10 md:p-16">
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Message sent!"); }}>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                <input type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" placeholder="john@company.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">How can we help?</label>
                                <textarea rows="4" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-600 outline-none transition-all resize-none" placeholder="Tell us about your project or issue..."></textarea>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all flex justify-center items-center gap-2">
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
