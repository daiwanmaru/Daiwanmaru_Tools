'use client';

import { PageShell } from '@/components/PageShell';
import Link from 'next/link';
import { BookOpen, PlayCircle, ChevronRight } from 'lucide-react';

export default function EducationPage() {
    const categories = [
        {
            title: 'Online Courses',
            href: '/education/courses',
            description: 'Structured learning paths for technical mastery.',
            count: '0 Courses'
        },
        {
            title: 'Articles & Insights',
            href: '/education/articles',
            description: 'Reflections on technology, culture, and creation.',
            count: '0 Articles'
        },
    ];

    return (
        <PageShell
            category="The Academy"
            title="Education"
            subtitle="Deep dives into technical concepts and structured online curriculum."
            heroImage="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2000&auto=format&fit=crop"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {categories.map((cat) => (
                    <Link key={cat.title} href={cat.href} className="group block">
                        <div className="border border-slate-100 p-12 hover:border-blue-600 transition-all duration-500 rounded-[2rem] bg-white h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-[10px] tracking-[.4em] font-bold text-blue-600 uppercase">Academy Section</span>
                                    <span className="text-[10px] tracking-[.3em] font-bold text-slate-300 uppercase">{cat.count}</span>
                                </div>
                                <h3 className="text-4xl font-medium serif text-slate-900 mb-6 group-hover:text-blue-600 transition-colors">
                                    {cat.title}
                                </h3>
                                <p className="text-slate-500 font-light leading-relaxed mb-12">
                                    {cat.description}
                                </p>
                            </div>
                            <div className="flex items-center text-[10px] tracking-[.4em] font-bold text-slate-900 uppercase group-hover:translate-x-2 transition-transform">
                                Explore <ChevronRight className="ml-2 h-3 w-3" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </PageShell>
    );
}

