import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default function ProductsPage() {
    return (
        <div className="container mx-auto px-4 py-20">
            <Link href="/" className="inline-flex items-center text-blue-600 mb-8 hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
            <div className="flex items-center mb-6">
                <ShoppingBag className="h-10 w-10 text-orange-600 mr-4" />
                <h1 className="text-4xl font-bold text-slate-900">Products</h1>
            </div>
            <div className="bg-orange-50 border border-orange-100 p-8 rounded-2xl text-center">
                <h2 className="text-2xl font-semibold text-orange-900 mb-4">Other Products</h2>
                <p className="text-orange-800">
                    Stay tuned for more products and services.
                </p>
            </div>
        </div>
    );
}
