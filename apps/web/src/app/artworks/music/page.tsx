'use client';

import { PageShell } from '@/components/PageShell';
import { Music as MusicIcon } from 'lucide-react';

export default function MusicPage() {
    return (
        <PageShell
            category="Creative Exhibit"
            title="Music & Audio"
            subtitle="Sonic landscapes and virtual performances."
        >
            <div className="min-h-[400px] flex flex-col items-center justify-center border border-dashed border-slate-100 rounded-[2rem]">
                <div className="p-6 bg-slate-50 rounded-full mb-6">
                    <MusicIcon className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-medium serif text-slate-900 mb-2">暫無內容</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[.3em]">
                    New audio tracks are currently in production.
                </p>
            </div>
        </PageShell>
    );
}
