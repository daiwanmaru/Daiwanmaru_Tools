'use client';

import { PageShell } from '@/components/PageShell';
import { Globe } from 'lucide-react';

export default function WebServicePage() {
    return (
        <PageShell
            category="System Labs"
            title="Web Services"
            subtitle="Cloud-based platforms and API solutions."
        >
            <div className="min-h-[400px] flex flex-col items-center justify-center border border-dashed border-slate-100 rounded-[2rem]">
                <div className="p-6 bg-slate-50 rounded-full mb-6">
                    <Globe className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-medium serif text-slate-900 mb-2">暫無內容</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[.3em]">
                    New services are being deployed.
                </p>
            </div>
        </PageShell>
    );
}
