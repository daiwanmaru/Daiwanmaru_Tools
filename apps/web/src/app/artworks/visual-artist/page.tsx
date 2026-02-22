'use client';

import { PageShell } from '@/components/PageShell';
import Link from 'next/link';

export default function VisualArtistPage() {
    const artists = [
        {
            name: 'LUMO',
            description: 'Japanese Visual Artist & Creative Director',
            image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1000&auto=format&fit=crop',
            href: 'https://www.youtube.com/@LUMO-jp',
            tag: 'Featured Artist'
        }
    ];

    return (
        <PageShell
            category="Creative Exhibit"
            title="Visual Artists"
            subtitle="Representing the new generation of digital and virtual creators."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {artists.map((artist) => (
                    <a
                        key={artist.name}
                        href={artist.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                    >
                        <div className="relative overflow-hidden mb-6 aspect-[4/5] border border-slate-100">
                            <img
                                src={artist.image}
                                alt={artist.name}
                                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                            />
                            <div className="absolute top-6 left-6">
                                <span className="bg-white/90 backdrop-blur px-3 py-1 text-[8px] font-black uppercase tracking-widest text-slate-900 border border-slate-100">
                                    {artist.tag}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-medium serif text-slate-900 group-hover:text-blue-600 transition-colors">
                                {artist.name}
                            </h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[.2em]">
                                {artist.description}
                            </p>
                        </div>
                    </a>
                ))}

                {/* Empty placeholders for gallery feel */}
                <div className="border border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-12 min-h-[400px]">
                    <h3 className="text-lg font-medium serif text-slate-300 mb-2">暫無內容</h3>
                    <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[.3em]">New Artist Coming Soon</p>
                </div>
            </div>
        </PageShell>
    );
}
