'use client';

import { PageShell } from '@/components/PageShell';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function ArtworksPage() {
    const categories = [
        {
            title: 'Illustration',
            href: '/artworks/illustration',
            description: 'Digital paintings and character designs.',
            count: '0 Works'
        },
        {
            title: 'Music & Audio',
            href: '/artworks/music',
            description: 'Sonic landscapes and virtual performances.',
            count: '0 Tracks'
        },
        {
            title: 'Visual Artist',
            href: '/artworks/visual-artist',
            description: 'Representing the new generation of creators.',
            count: '1 Artist'
        },
    ];

    return (
        <PageShell
            category="Creative Exhibit"
            title="Artworks"
            subtitle="A curated gallery of visual, audio, and video creations."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {categories.map((cat) => (
                    <Link key={cat.title} href={cat.href} className="group block h-full">
                        <div className="border border-slate-100 p-12 hover:border-blue-600 transition-all duration-500 rounded-[2rem] bg-white h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-[10px] tracking-[.4em] font-bold text-blue-600 uppercase">Collection</span>
                                    <span className="text-[10px] tracking-[.3em] font-bold text-slate-300 uppercase">{cat.count}</span>
                                </div>
                                <h3 className="text-3xl font-medium serif text-slate-900 mb-6 group-hover:text-blue-600 transition-colors">
                                    {cat.title}
                                </h3>
                                <p className="text-slate-500 text-xs font-light leading-relaxed mb-12">
                                    {cat.description}
                                </p>
                            </div>
                            <div className="flex items-center text-[10px] tracking-[.4em] font-bold text-slate-900 uppercase group-hover:translate-x-2 transition-transform">
                                View Gallery <ChevronRight className="ml-2 h-3 w-3" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </PageShell>
    );
}
