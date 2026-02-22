'use client';

import { PageShell } from '@/components/PageShell';

export default function ArtworksPage() {
    const works = [
        { title: 'Neon Reflections', artist: 'Daiwan-kun', year: '2026', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop' },
        { title: 'The Sound of Silence', artist: 'Virtual Soul', year: '2025', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1000&auto=format&fit=crop' },
        { title: 'Digital Fragments', artist: 'MIOW', year: '2026', image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop' },
    ];

    return (
        <PageShell
            category="Creative Exhibit"
            title="Artworks"
            subtitle="A curated gallery of visual, audio, and video creations. Home of the virtual artist project."
        >
            <div className="space-y-32">
                {works.map((work, index) => (
                    <div key={work.title} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-16 items-center group`}>
                        <div className="flex-1 overflow-hidden border border-slate-100">
                            <img
                                src={work.image}
                                alt={work.title}
                                className="w-full aspect-[4/5] object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                            />
                        </div>
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center space-x-3">
                                <span className="text-[10px] tracking-[.3em] font-bold text-slate-400 uppercase">Collection 0{index + 1}</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-medium serif text-slate-900 leading-tight">
                                {work.title}
                            </h2>
                            <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-8 text-[10px] tracking-widest uppercase text-slate-500 font-bold">
                                <div>
                                    <span className="block text-slate-300 mb-1 font-normal tracking-editorial">Artist</span>
                                    {work.artist}
                                </div>
                                <div>
                                    <span className="block text-slate-300 mb-1 font-normal tracking-editorial">Year</span>
                                    {work.year}
                                </div>
                            </div>
                            <p className="text-slate-500 font-light leading-relaxed pt-6">
                                An exploration into the relationship between organic forms and digital
                                processing. This piece represents the evolution of our virtual identity.
                            </p>
                            <button className="text-[10px] tracking-[.4em] font-bold text-slate-900 uppercase pt-4 hover:text-blue-600 transition-colors">
                                View Details +
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </PageShell>
    );
}
