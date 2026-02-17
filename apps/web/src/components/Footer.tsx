'use client';

import { Twitter, Instagram, MessageCircle, Github } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-8 md:mb-0">
                        <span className="text-2xl font-bold text-blue-600">Daiwanmaru <span className="text-gray-900">Tool</span></span>
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
