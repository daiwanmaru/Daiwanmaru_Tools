import { notFound, redirect } from 'next/navigation';
import { prisma } from '@daiwanmaru/core';
import { UploadZone } from '@/components/UploadZone';
import { Sidebar } from '@/components/Sidebar';

export interface ToolPageProps {
    params: Promise<{ slug: string }>;
}

export default async function ToolPage(props: ToolPageProps) {
    const { slug } = await props.params;

    if (slug === 'combine-to-pdf' || slug === 'pdf-merge') {
        redirect('/tools/pdf-merge');
    }

    if (slug === 'markdown-converter') {
        redirect('/tools/markdown-converter');
    }

    if (slug === 'image-resize') {
        redirect('/tools/image-resize');
    }

    const tool = await prisma.tool.findUnique({
        where: { slug: slug },
    });

    if (!tool) {
        notFound();
    }

    // Ensure tool.category is defined before passing to Sidebar
    const category = tool.category || 'DOC'; // Fallback

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <div className="hidden md:block w-64 mr-8">
                <Sidebar currentCategory={category} />
            </div>

            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl w-full mx-auto space-y-8 text-center">
                    <div>
                        <h1 className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                            {tool.name}
                        </h1>
                        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                            {tool.description || 'Powerful online tool for your files.'}
                        </p>
                    </div>

                    <div className="mt-10 bg-white p-8 rounded-2xl shadow-sm border border-dashed border-blue-200">
                        <UploadZone tool={tool} />
                    </div>

                    <div className="mt-8 text-sm text-gray-400">
                        <p>Uploaded and generated files are deleted 1 hour after upload used for processing.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
