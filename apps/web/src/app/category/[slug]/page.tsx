import { prisma } from '@daiwanmaru/core';
import { Sidebar } from '@/components/Sidebar';
import { notFound } from 'next/navigation';

export interface CategoryPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: CategoryPageProps) {
    const { slug } = await props.params;
    return {
        title: `${slug.toUpperCase()} Tools - Daiwanmaru Tool`,
        description: `All available ${slug} tools.`,
    };
}

export default async function CategoryPage(props: CategoryPageProps) {
    const { slug } = await props.params;
    const category = slug.toUpperCase();

    // Validate category
    const validCategories = ['DOC', 'IMAGE', 'VIDEO', 'AUDIO'];
    if (!validCategories.includes(category)) {
        notFound();
    }

    const tools = await prisma.tool.findMany({
        where: { category: category },
    });

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <div className="hidden md:block w-64 mr-8">
                <Sidebar currentCategory={category} />
            </div>

            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="md:flex md:items-center md:justify-between mb-8">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                                {category} Tools
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {tools.map((tool) => (
                            <a
                                key={tool.id}
                                href={`/tools/${tool.slug}`}
                                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                                <div className="flex-shrink-0">
                                    {/* Icon placeholder based on category */}
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {category[0]}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-sm font-medium text-gray-900">{tool.name}</p>
                                    <p className="text-sm text-gray-500 truncate">{tool.description}</p>
                                </div>
                            </a>
                        ))}

                        {tools.length === 0 && (
                            <div className="col-span-3 text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                No tools available in this category yet.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
