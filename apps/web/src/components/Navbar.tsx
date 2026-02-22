'use client';

import Link from 'next/link';
import { Search, Instagram, Youtube } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export function Navbar() {
    const { status } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Tools', href: '/tools' },
        { name: 'Education', href: '/education' },
        { name: 'Artworks', href: '/artworks' },
        { name: 'Products', href: '/products' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <header className="bg-white pt-8">
            {/* Top Slogan */}
            <div className="text-center mb-6">
                <p className="tracking-editorial text-slate-500">
                    EVERYTHING IS CREATIVE. INCLUDING THIS PROJECT.
                </p>
            </div>

            {/* Big Logo Title */}
            <div className="text-center mb-8">
                <Link href="/" className="inline-block">
                    <h1 className="text-7xl font-medium tracking-tight text-slate-900 serif">
                        Daiwanmaru
                    </h1>
                </Link>
            </div>

            {/* Navigation Bar Grid */}
            <nav className="border-t border-b border-slate-100">
                <div className="max-w-7xl mx-auto flex h-14">
                    {/* Desktop Menu */}
                    <div className="hidden md:flex flex-grow border-l border-slate-100">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="nav-grid-item text-xs font-normal text-slate-600 hover:text-blue-600 transition-colors tracking-widest uppercase"
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* Search Cell */}
                        <div className="nav-grid-item border-r border-slate-100">
                            <button className="text-slate-400 hover:text-slate-900 transition-colors">
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Social Media Cell */}
                    <div className="hidden md:flex border-r border-slate-100 items-center px-6 space-x-4">
                        <a href="#" className="text-slate-400 hover:text-black transition-colors" title="X">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26l8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                        <a href="#" className="text-slate-400 hover:text-pink-500 transition-colors">
                            <Instagram className="h-4 w-4" />
                        </a>
                        <a href="#" className="text-slate-400 hover:text-red-600 transition-colors">
                            <Youtube className="h-4 w-4" />
                        </a>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden flex items-center px-4 w-full justify-between">
                        <Link href="/" className="serif text-xl font-bold">D.</Link>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-600 text-xs tracking-widest uppercase"
                        >
                            Menu
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block px-6 py-4 text-xs tracking-widest uppercase border-b border-slate-50 text-slate-600"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                )}
            </nav>
        </header>
    );
}
