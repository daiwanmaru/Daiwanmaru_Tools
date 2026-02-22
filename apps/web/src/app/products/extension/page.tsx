'use client';

import { PageShell } from '@/components/PageShell';
import { Puzzle } from 'lucide-react';

export default function ExtensionPage() {
    return (
        <PageShell
            category="System Labs"
            title="Browser Extensions"
            subtitle="Enhancing your digital workflow directly in the browser."
        >
            <div className="min-h-[400px] flex flex-col items-center justify-center border border-dashed border-slate-100 rounded-[2rem]">
                <div className="p-6 bg-slate-50 rounded-full mb-6">
                    <Puzzle className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-medium serif text-slate-900 mb-2">暫無內容</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[.3em]">
                    Extensions are currently in beta testing.
                </p>
            </div>
        </PageShell>
    );
}
