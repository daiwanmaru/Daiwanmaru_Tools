'use client';

import Link from 'next/link';
import { Menu, Search, User, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export function Navbar() {
    const { data: session, status } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const navItems = [
        { name: 'DOC', href: '/category/doc' },
        { name: 'IMAGE', href: '/category/image' },
        { name: 'VIDEO', href: '/category/video' },
        { name: 'AUDIO', href: '/category/audio' },
    ];

    const isLoading = status === 'loading';

    return (
        <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center space-x-2 group">
                            <img src="/logo-icon.png" alt="Daiwanmaru Icon" className="h-10 w-auto group-hover:scale-110 transition-transform duration-300" />
                            <img src="/logo-text.png" alt="Daiwanmaru Tool" className="h-6 w-auto hidden sm:block" />
                        </Link>
                        <div className="hidden md:ml-10 md:flex md:space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="ml-2 bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400 w-32 lg:w-48"
                            />
                        </div>

                        {isLoading ? (
                            <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
                        ) : session ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    {session.user?.image ? (
                                        <img src={session.user.image} alt="" className="h-8 w-8 rounded-full" />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                    )}
                                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                                        {session.user?.name || session.user?.email?.split('@')[0]}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs text-gray-400">Signed in as</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">{session.user?.email}</p>
                                        </div>
                                        <Link
                                            href="/account"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Account Settings
                                        </Link>
                                        <button
                                            onClick={() => signOut()}
                                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-2"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            >
                                {item.name}
                            </Link>
                        ))}
                        {!session && (
                            <Link
                                href="/login"
                                className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
