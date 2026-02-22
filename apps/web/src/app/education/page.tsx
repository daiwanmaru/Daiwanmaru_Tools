import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function EducationPage() {
    return (
        <div className="container mx-auto px-4 py-20">
            <Link href="/" className="inline-flex items-center text-blue-600 mb-8 hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
            <div className="flex items-center mb-6">
                <BookOpen className="h-10 w-10 text-teal-600 mr-4" />
                <h1 className="text-4xl font-bold text-slate-900">Education</h1>
            </div>
            <div className="bg-teal-50 border border-teal-100 p-8 rounded-2xl">
                <h2 className="text-2xl font-semibold text-teal-900 mb-4">Technical Teaching & Courses</h2>
                <p className="text-teal-800 mb-6">
                    I will be sharing technical articles, tutorials, and online courses here very soon.
                </p>
                <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-teal-200 rounded w-3/4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-teal-200 rounded"></div>
                            <div className="h-4 bg-teal-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
