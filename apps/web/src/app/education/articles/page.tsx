'use client';

import { PageShell } from '@/components/PageShell';
import { FileText } from 'lucide-react';

export default function ArticlesPage() {
    return (
        <PageShell
            category="The Academy"
            title="Articles & Insights"
            subtitle="Deep dives into technical concepts and creative processes."
        >
            <div className="min-h-[400px] flex flex-col items-center justify-center border border-dashed border-slate-100 rounded-[2rem]">
                <div className="p-6 bg-slate-50 rounded-full mb-6">
                    <FileText className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-medium serif text-slate-900 mb-2">暫無內容</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[.3em]">
                    New articles are currently being drafted.
                </p>
            </div>
        </PageShell>
    );
}
