'use client';

import { PageShell } from '@/components/PageShell';

export default function ContactPage() {
    return (
        <PageShell
            category="Support"
            title="Get in Touch"
            subtitle="Have a question, a suggestion, or just want to say hello? Reach out to the Daiwanmaru team."
        >
            <div className="max-w-2xl mx-auto border border-slate-100 p-8 md:p-12">
                <form className="space-y-8">
                    <div>
                        <label className="block text-[10px] tracking-[.3em] font-bold text-slate-900 uppercase mb-3">Name</label>
                        <input
                            type="text"
                            className="w-full bg-white border-b border-slate-200 py-2 focus:border-blue-600 outline-none transition-colors text-slate-900 font-light"
                            placeholder="Your Name"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] tracking-[.3em] font-bold text-slate-900 uppercase mb-3">Email</label>
                        <input
                            type="email"
                            className="w-full bg-white border-b border-slate-200 py-2 focus:border-blue-600 outline-none transition-colors text-slate-900 font-light"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] tracking-[.3em] font-bold text-slate-900 uppercase mb-3">Message</label>
                        <textarea
                            rows={4}
                            className="w-full bg-white border-b border-slate-200 py-2 focus:border-blue-600 outline-none transition-colors text-slate-900 font-light resize-none"
                            placeholder="How can we help?"
                        />
                    </div>
                    <button className="w-full bg-slate-900 text-white py-4 text-[10px] tracking-[.4em] font-bold uppercase hover:bg-blue-600 transition-colors">
                        Send Message
                    </button>
                </form>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-slate-50 pt-16">
                <div>
                    <h4 className="text-[10px] tracking-[.3em] font-bold text-slate-900 uppercase mb-2">Email</h4>
                    <p className="text-slate-500 font-light text-sm">hello@daiwanmaru.com</p>
                </div>
                <div>
                    <h4 className="text-[10px] tracking-[.3em] font-bold text-slate-900 uppercase mb-2">Location</h4>
                    <p className="text-slate-500 font-light text-sm">Tokyo, Japan</p>
                </div>
                <div>
                    <h4 className="text-[10px] tracking-[.3em] font-bold text-slate-900 uppercase mb-2">Social</h4>
                    <p className="text-slate-500 font-light text-sm">@daiwanmaru</p>
                </div>
            </div>
        </PageShell>
    );
}
