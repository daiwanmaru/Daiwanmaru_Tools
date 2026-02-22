import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-20">
            <Link href="/" className="inline-flex items-center text-blue-600 mb-8 hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-8 text-slate-900 flex items-center">
                <Mail className="mr-4 h-10 w-10 text-blue-600" /> Get in Touch
            </h1>
            <div className="max-w-xl bg-white shadow-xl rounded-2xl p-8 border border-slate-100">
                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                        <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Your Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="your@email.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                        <textarea className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32" placeholder="Tell me about your project..."></textarea>
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                        Send Message
                    </button>
                </form>
            </div>
        </div>
    );
}
