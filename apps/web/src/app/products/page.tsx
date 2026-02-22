import { PageShell } from '@/components/PageShell';

export default function ProductsPage() {
    return (
        <PageShell
            category="The Lab"
            title="Products"
            subtitle="Innovative software solutions and digital products from the Daiwanmaru laboratory."
        >
            <div className="min-h-[400px] flex flex-col items-center justify-center border border-dashed border-slate-100 rounded-[2rem]">
                <h3 className="text-xl font-medium serif text-slate-900 mb-2">暫無內容</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[.3em]">
                    No launched products yet.
                </p>
            </div>

            <div className="mt-32 pt-24 border-t border-slate-100 text-center">
                <p className="text-[10px] tracking-[.4em] text-slate-300 uppercase font-black">
                    Daiwanmaru Digital Laboratories © 2026
                </p>
            </div>
        </PageShell>
    );
}
