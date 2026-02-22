'use client';

import { ReactNode } from 'react';

interface PageShellProps {
    category?: string;
    title: string;
    subtitle?: string;
    children: ReactNode;
    heroImage?: string;
}

export function PageShell({ category, title, subtitle, children, heroImage }: PageShellProps) {
    return (
        <main className="min-h-screen bg-white pb-32">
            {/* Header / Hero Section */}
            <section className="pt-20 pb-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    {category && (
                        <div className="flex items-center justify-center space-x-2 mb-6">
                            <span className="w-8 h-[1px] bg-blue-600"></span>
                            <span className="text-[10px] tracking-[.4em] font-bold text-blue-600 uppercase">
                                {category}
                            </span>
                            <span className="w-8 h-[1px] bg-blue-600"></span>
                        </div>
                    )}

                    <h1 className="text-5xl md:text-7xl font-medium text-slate-900 serif mb-8 leading-tight">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="max-w-2xl mx-auto text-slate-500 uppercase tracking-[.25em] text-[10px] leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
            </section>

            {/* Optional Hero Image */}
            {heroImage && (
                <div className="max-w-6xl mx-auto px-4 mb-24">
                    <div className="aspect-[21/9] overflow-hidden bg-slate-100 border border-slate-100">
                        <img
                            src={heroImage}
                            alt={title}
                            className="w-full h-full object-cover grayscale-[20%] transition-all duration-1000"
                        />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <section className="px-4">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </section>
        </main>
    );
}
