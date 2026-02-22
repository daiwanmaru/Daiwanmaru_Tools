'use client';

import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 py-20 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 text-center md:text-left">
                    <div className="max-w-xs">
                        <Link href="/" className="inline-block mb-4">
                            <h2 className="text-3xl font-medium text-slate-900 serif">Daiwanmaru</h2>
                        </Link>
                        <p className="text-[11px] tracking-[.2em] text-slate-400 leading-relaxed uppercase">
                            Empowering creativity through technology and design.
                        </p>
                    </div>

                    <div className="flex items-center space-x-12">
                        <div className="flex flex-col space-y-4">
                            <h4 className="text-[10px] tracking-[.4em] font-bold text-slate-900 uppercase">Explore</h4>
                            <div className="flex flex-col space-y-2 text-[11px] text-slate-500 uppercase tracking-widest">
                                <Link href="/tools" className="hover:text-blue-600 transition-colors">Tools</Link>
                                <Link href="/education" className="hover:text-blue-600 transition-colors">Education</Link>
                                <Link href="/artworks" className="hover:text-blue-600 transition-colors">Artworks</Link>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-4">
                            <h4 className="text-[10px] tracking-[.4em] font-bold text-slate-900 uppercase">Legal</h4>
                            <div className="flex flex-col space-y-2 text-[11px] text-slate-500 uppercase tracking-widest">
                                <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
                                <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
                                <Link href="/contact" className="hover:text-blue-600 transition-colors">Support</Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-[10px] tracking-widest text-slate-400 uppercase">
                        © 2026 Daiwanmaru. All rights reserved.
                    </p>
                    <p className="text-[9px] tracking-[.3em] text-slate-300 italic uppercase">
                        Everything is Creative.
                    </p>
                </div>
            </div>
        </footer>
    );
}
