import Link from 'next/link';
import { ArrowLeft, Palette } from 'lucide-react';

export default function ArtworksPage() {
    return (
        <div className="container mx-auto px-4 py-20">
            <Link href="/" className="inline-flex items-center text-blue-600 mb-8 hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
            <div className="flex items-center mb-6">
                <Palette className="h-10 w-10 text-purple-600 mr-4" />
                <h1 className="text-4xl font-bold text-slate-900">Artworks</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-purple-50 border border-purple-100 p-8 rounded-2xl">
                    <h2 className="text-2xl font-semibold text-purple-900 mb-4">Virtual Artist Project</h2>
                    <p className="text-purple-800">
                        A home for various visual, video, and music works, including virtual characters.
                    </p>
                </div>
                <div className="flex items-center justify-center border-4 border-dashed border-purple-100 rounded-2xl h-64">
                    <p className="text-purple-300 font-bold text-xl uppercase tracking-widest">Under Creation</p>
                </div>
            </div>
        </div>
    );
}
