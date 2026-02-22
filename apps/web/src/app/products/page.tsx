'use client';

import { PageShell } from '@/components/PageShell';

export default function ProductsPage() {
    const products = [
        { name: 'Daiwan App', category: 'Mobile', status: 'In Alpha' },
        { name: 'Maru Service', category: 'Web', status: 'Launched' },
        { name: 'Studio Extension', category: 'Plugin', status: 'Beta' },
    ];

    return (
        <PageShell
            category="The Lab"
            title="Products"
            subtitle="Innovative software solutions and digital products from the Daiwanmaru laboratory."
            heroImage="https://images.unsplash.com/photo-1542744094-24638eff58bb?q=80&w=2000&auto=format&fit=crop"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {products.map((product) => (
                    <div key={product.name} className="group border border-slate-100 p-8 hover:bg-slate-50 transition-all duration-500 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <div className="w-8 h-8 rounded-full bg-slate-900 group-hover:bg-blue-600 transition-colors"></div>
                        </div>
                        <h3 className="text-2xl font-medium serif text-slate-900 mb-2">{product.name}</h3>
                        <p className="text-[10px] tracking-[.3em] font-bold text-slate-400 uppercase mb-8">{product.category}</p>

                        <div className="mt-auto space-y-4 w-full">
                            <span className="block text-[9px] tracking-widest uppercase text-blue-600 font-bold bg-blue-50 py-2">
                                {product.status}
                            </span>
                            <button className="w-full border border-slate-200 py-3 text-[10px] tracking-[.4em] font-bold uppercase text-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                                View Product
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-32 border-t border-slate-100 pt-20 text-center">
                <h2 className="text-3xl font-medium serif text-slate-900 mb-8">Have an Idea?</h2>
                <p className="text-slate-500 font-light max-w-xl mx-auto mb-12">
                    We're always looking for new challenges and partnership opportunities.
                    Let's build something extraordinary together.
                </p>
                <div className="flex justify-center">
                    <button className="text-[10px] tracking-[.4em] font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 hover:text-blue-600 hover:border-blue-600 transition-all">
                        Collaborate with Us
                    </button>
                </div>
            </div>
        </PageShell>
    );
}
