'use client';

import Link from 'next/link';
import { Search, Instagram, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export function Navbar() {
    const { status } = useSession();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const isToolsPage = pathname?.startsWith('/tools');

    interface NavItem {
        name: string;
        href: string;
        sections?: Array<{ name: string; href: string }>;
    }

    const mainNavItems: NavItem[] = [
        { name: 'Home', href: '/' },
        {
            name: 'Tools',
            href: '/tools',
            sections: [
                { name: 'Doc', href: '/tools?category=DOC' },
                { name: 'Image', href: '/tools?category=IMAGE' },
                { name: 'Video', href: '/tools?category=VIDEO' },
                { name: 'Audio', href: '/tools?category=AUDIO' },
            ]
        },
        {
            name: 'Education',
            href: '/education',
            sections: [
                { name: 'Courses', href: '/education/courses' },
                { name: 'Articles', href: '/education/articles' },
            ]
        },
        {
            name: 'Artworks',
            href: '/artworks',
            sections: [
                { name: 'Illustration', href: '/artworks/illustration' },
                { name: 'Music', href: '/artworks/music' },
                { name: 'Visual Artist', href: '/artworks/visual-artist' },
            ]
        },
        {
            name: 'Products',
            href: '/products',
            sections: [
                { name: 'App', href: '/products/app' },
                { name: 'Web Service', href: '/products/web-service' },
                { name: 'Extension', href: '/products/extension' },
            ]
        },
        { name: 'Contact', href: '/contact' },
    ];

    const toolsNavItems: NavItem[] = [
        { name: 'Home', href: '/' },
        { name: 'Doc', href: '/tools?category=DOC' },
        { name: 'Image', href: '/tools?category=IMAGE' },
        { name: 'Video', href: '/tools?category=VIDEO' },
        { name: 'Audio', href: '/tools?category=AUDIO' },
        { name: 'All Tools', href: '/tools' },
    ];

    const navItems = isToolsPage ? toolsNavItems : mainNavItems;

    return (
        <header className="bg-white pt-8 relative z-50">
            {/* Big Logo Title */}
            <div className="text-center mb-8 px-4">
                <Link href="/" className="inline-block relative group">
                    {/* Mascot Visual Next to Title */}
                    <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-16 h-16 hidden lg:block hover:-rotate-12 transition-transform duration-300">
                        <img
                            src="/logo-icon.png"
                            alt="Daiwan-kun Mascot"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <h1 className="text-7xl font-medium tracking-tight text-slate-900 serif">
                        Daiwanmaru
                    </h1>

                    <div className="absolute -right-16 bottom-0 w-12 h-12 hidden xl:block opacity-20 group-hover:opacity-100 transition-opacity">
                        <img
                            src="/logo-icon.png"
                            alt="Daiwan-kun Mascot Smaller"
                            className="w-full h-full object-contain grayscale"
                        />
                    </div>
                </Link>
            </div>

            {/* Navigation Bar Grid */}
            <nav className="border-t border-b border-slate-100">
                <div className="max-w-7xl mx-auto flex h-14">
                    {/* Desktop Menu */}
                    <div className="hidden md:flex flex-grow border-l border-slate-100">
                        {navItems.map((item: NavItem) => (
                            <div
                                key={item.name}
                                className="relative group flex h-full"
                                onMouseEnter={() => item.sections && setActiveDropdown(item.name)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <Link
                                    href={item.href}
                                    className="nav-grid-item text-[10px] font-normal text-slate-600 hover:text-blue-600 transition-colors tracking-widest uppercase flex items-center"
                                >
                                    {item.name}
                                    {item.sections && <ChevronDown className="ml-1.5 h-3 w-3 opacity-40" />}
                                </Link>

                                {/* Dropdown Menu */}
                                {item.sections && (
                                    <div className={`
                                        absolute top-full left-0 bg-white border-l border-r border-b border-slate-100 
                                        min-w-[200px] transition-all duration-300 overflow-hidden
                                        ${activeDropdown === item.name ? 'opacity-100 visible h-auto' : 'opacity-0 invisible h-0'}
                                    `}>
                                        <div className="py-2">
                                            {item.sections.map((subItem: { name: string; href: string }) => (
                                                <Link
                                                    key={subItem.name}
                                                    href={subItem.href}
                                                    className="block px-6 py-3 text-[10px] tracking-widest uppercase text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                                                >
                                                    {subItem.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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
                        <a href="https://x.com/daiwanmaru" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-black transition-colors" title="X">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26l8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                        <a href="https://www.instagram.com/daiwanmaru/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors" title="Instagram">
                            <Instagram className="h-4 w-4" />
                        </a>
                        <a href="https://www.threads.com/@daiwanmaru" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-black transition-colors" title="Threads">
                            <svg className="h-4 w-4" viewBox="0 0 192 192" fill="currentColor">
                                <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
                            </svg>
                        </a>
                        {/* Account System */}
                        <div className="hidden lg:flex items-center px-6 border-l border-slate-100 space-x-6">
                            {status === 'authenticated' ? (
                                <Link href="/account" className="text-[10px] tracking-[.3em] font-bold text-slate-900 uppercase hover:text-blue-600 transition-colors">
                                    Account
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" className="text-[10px] tracking-[.3em] font-bold text-slate-900 uppercase hover:text-blue-600 transition-colors">
                                        Sign In
                                    </Link>
                                    <Link href="/register" className="text-[10px] tracking-[.3em] font-bold text-blue-600 uppercase hover:text-blue-700 transition-colors">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden flex items-center px-4 w-full justify-between">
                        <Link href="/" className="flex items-center space-x-2">
                            <img
                                src="/logo-icon.png"
                                alt="Daiwan-kun Mascot"
                                className="w-8 h-8 object-contain"
                            />
                            <span className="serif text-xl font-bold text-slate-900">Daiwanmaru</span>
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-600 text-xs tracking-widest uppercase flex items-center"
                        >
                            <span className="mr-2">{isMenuOpen ? 'Close' : 'Menu'}</span>
                            <div className="w-6 h-6 flex flex-col justify-center items-center">
                                <span className={`block w-4 h-0.5 bg-slate-600 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'}`}></span>
                                <span className={`block w-4 h-0.5 bg-slate-600 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-0' : 'translate-y-1'}`}></span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white max-h-[80vh] overflow-y-auto">
                        {navItems.map((item: NavItem) => (
                            <div key={item.name} className="border-b border-slate-50">
                                <Link
                                    href={item.href}
                                    className="block px-6 py-4 text-xs tracking-widest uppercase text-slate-600 font-bold"
                                    onClick={() => !item.sections && setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                                {item.sections && (
                                    <div className="bg-slate-50 pb-2">
                                        {item.sections.map((subItem: { name: string; href: string }) => (
                                            <Link
                                                key={subItem.name}
                                                href={subItem.href}
                                                className="block px-10 py-3 text-[10px] tracking-widest uppercase text-slate-500"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {subItem.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Mobile Account Links */}
                        <div className="border-t border-slate-100 bg-slate-50 px-6 py-6 flex flex-col space-y-4">
                            {status === 'authenticated' ? (
                                <Link href="/account" className="text-xs tracking-widest uppercase text-slate-900 font-bold" onClick={() => setIsMenuOpen(false)}>
                                    Your Account
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" className="text-xs tracking-widest uppercase text-slate-900 font-bold" onClick={() => setIsMenuOpen(false)}>
                                        Sign In
                                    </Link>
                                    <Link href="/register" className="text-xs tracking-widest uppercase text-blue-600 font-bold" onClick={() => setIsMenuOpen(false)}>
                                        Register New Account
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
