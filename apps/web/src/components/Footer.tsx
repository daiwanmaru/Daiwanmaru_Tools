'use client';

import { Twitter, Instagram, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-8 md:mb-0">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <img src="/logo-icon.png" alt="Daiwanmaru Icon" className="h-8 w-auto opacity-80 group-hover:opacity-100 transition-opacity" />
                            <img src="/logo-text.png" alt="Daiwanmaru Tool" className="h-5 w-auto" />
                        </Link>
                        <p className="mt-2 text-sm text-gray-500">© 2026 Daiwanmaru Tools. All rights reserved.</p>
                    </div>

                    <div className="flex space-x-6">
                        <a
                            href="https://x.com/daiwanmaru"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                        >
                            <span className="sr-only">X (Twitter)</span>
                            <Twitter className="h-6 w-6" />
                        </a>
                        <a
                            href="https://www.instagram.com/daiwanmaru/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-pink-500 transition-colors"
                        >
                            <span className="sr-only">Instagram</span>
                            <Instagram className="h-6 w-6" />
                        </a>
                        <a
                            href="https://www.threads.com/@daiwanmaru"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-black transition-colors"
                        >
                            <span className="sr-only">Threads</span>
                            <MessageCircle className="h-6 w-6" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
