import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-20">
            <Link href="/" className="inline-flex items-center text-blue-600 mb-8 hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-6 text-slate-900">About Daiwan-kun</h1>
            <div className="prose prose-lg max-w-none text-slate-600">
                <p>This is the story of Daiwan-kun and the Daiwanmaru platform.</p>
                <p>Work in progress...</p>
            </div>
        </div>
    );
}
