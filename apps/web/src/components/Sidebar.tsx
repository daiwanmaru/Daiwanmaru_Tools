import Link from 'next/link';
import { prisma } from '@daiwanmaru/core';

interface SidebarProps {
    currentCategory: string;
}

export async function Sidebar({ currentCategory }: SidebarProps) {
    const tools = await prisma.tool.findMany({
        where: { category: currentCategory.toUpperCase() },
    });

    return (
        <aside className="w-64 bg-white border-r border-gray-100 min-h-[calc(100vh-4rem)] hidden md:block">
            <div className="p-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    {currentCategory} Tools
                </h3>
                <nav className="space-y-1">
                    {tools.map((tool) => (
                        <Link
                            key={tool.id}
                            href={`/tools/${tool.slug}`}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 group"
                        >
                            <span className="truncate">{tool.name}</span>
                        </Link>
                    ))}
                    {tools.length === 0 && (
                        <p className="text-sm text-gray-500 italic px-3">No tools yet.</p>
                    )}
                </nav>
            </div>
        </aside>
    );
}
