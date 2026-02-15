export const dynamic = "force-dynamic";
import Link from 'next/link';
import { getAllTools } from '@daiwanmaru/core';

export default async function ToolsPage() {
    const tools = await getAllTools();

    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Our Toolbox
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tools.map((tool) => (
                    <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        className="group block p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
                    >
                        <h2 className="text-2xl font-semibold mb-3 group-hover:text-blue-500 transition-colors">
                            {tool.name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {tool.description}
                        </p>
                        <div className="mt-6 flex items-center text-blue-500 font-medium">
                            Try it now
                            <svg
                                className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
