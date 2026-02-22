'use client';

import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 py-20 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 text-center md:text-left">
                    <div className="max-w-xs">
                        <Link href="/" className="inline-flex items-center space-x-3 mb-4">
                            <img src="/logo-icon.png" alt="Logo" className="w-10 h-10 object-contain" />
                            <h2 className="text-3xl font-medium text-slate-900 serif">Daiwanmaru</h2>
                        </Link>
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
                        <div className="flex flex-col space-y-4 text-left">
                            <h4 className="text-[10px] tracking-[.4em] font-bold text-slate-900 uppercase">Connect</h4>
                            <div className="flex flex-col space-y-2 text-[11px] text-slate-500 uppercase tracking-widest">
                                <a href="https://x.com/daiwanmaru" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">X / Twitter</a>
                                <a href="https://www.instagram.com/daiwanmaru/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Instagram</a>
                                <a href="https://www.threads.com/@daiwanmaru" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Threads</a>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-4 text-left">
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
                </div>
            </div>
        </footer>
    );
}
