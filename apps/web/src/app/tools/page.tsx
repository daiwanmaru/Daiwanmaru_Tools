import Link from 'next/link';
import { getAllTools } from '@daiwanmaru/core';

export const dynamic = 'force-dynamic';

interface Tool {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    category: string;
}

export default async function ToolsPage() {
    let tools: Tool[] = [];
    let error: string | null = null;

    try {
        tools = (await getAllTools()) as Tool[];
    } catch (err) {
        console.error('Failed to fetch tools:', err);
        error = err instanceof Error ? err.message : 'Unknown error';
    }

    const grouped = tools.reduce((acc: any, tool: any) => {
        const category = tool.category || 'OTHER';
        if (!acc[category]) acc[category] = [];
        acc[category].push(tool);
        return acc;
    }, {});

    const categoryOrder = ['DOC', 'IMAGE', 'VIDEO', 'AUDIO'];
    const hasTools = tools.length > 0;

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <div className="text-xl font-medium serif text-red-600 mb-2">Technical Issue</div>
                    <div className="text-slate-400 text-xs tracking-widest uppercase">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto mb-24 text-center">
                <h2 className="text-[10px] tracking-[.4em] font-bold text-blue-600 uppercase mb-4">The Collection</h2>
                <h1 className="text-6xl md:text-7xl font-medium text-slate-900 serif mb-8 leading-tight">
                    Professional Toolbox
                </h1>
                <div className="w-16 h-[2px] bg-slate-100 mx-auto mb-8"></div>
                <p className="max-w-xl mx-auto text-slate-500 uppercase tracking-[.25em] text-[10px]">
                    Curated utilities for document management, image processing, and media conversion.
                </p>
            </div>

            <div className="max-w-5xl mx-auto">
                {categoryOrder.map(category => {
                    const categoryTools = grouped[category];
                    if (!categoryTools || categoryTools.length === 0) return null;

                    return (
                        <div key={category} className="mb-24">
                            <div className="flex items-center justify-between mb-12 border-b border-slate-100 pb-4">
                                <h2 className="text-3xl font-medium text-slate-900 serif uppercase tracking-tight">{category}</h2>
                                <span className="text-[9px] tracking-[.3em] text-slate-400 font-bold uppercase">{categoryTools.length} Utilities</span>
                            </div>

                            <div className="grid gap-12 lg:grid-cols-2">
                                {categoryTools.map((tool: any) => (
                                    <div key={tool.id} className="group relative">
                                        <Link href={`/tools/${tool.slug}`} className="block">
                                            <div className="flex flex-col space-y-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="w-6 h-[1px] bg-blue-600"></span>
                                                    <span className="text-[9px] tracking-[.3em] font-bold text-blue-600 uppercase">Available</span>
                                                </div>
                                                <h3 className="text-2xl font-medium text-slate-900 serif group-hover:text-blue-600 transition-colors">
                                                    {tool.name}
                                                </h3>
                                                <p className="text-slate-500 text-sm leading-relaxed font-light">
                                                    {tool.description}
                                                </p>
                                                <div className="pt-4 flex items-center text-[10px] tracking-[.3em] font-bold text-slate-900 uppercase group-hover:translate-x-2 transition-transform">
                                                    Launch Tool <ArrowRight className="ml-2 h-3 w-3" />
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {!hasTools && (
                    <div className="text-center py-32 border border-dashed border-slate-100 rounded-lg">
                        <p className="text-slate-400 text-xs tracking-widest uppercase">No utilities found in registry.</p>
                    </div>
                )}
            </div>

            <div className="mt-32 pt-12 border-t border-slate-50 text-center">
                <p className="text-[9px] tracking-[.4em] text-slate-300 uppercase">
                    System Hub: Connected to Cloud Infrastructure
                </p>
            </div>
        </main>
    );
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    );
}
