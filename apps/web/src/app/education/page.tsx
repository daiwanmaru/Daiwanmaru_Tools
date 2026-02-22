'use client';

import { PageShell } from '@/components/PageShell';
import Link from 'next/link';
import { BookOpen, PlayCircle } from 'lucide-react';

export default function EducationPage() {
    const courses = [
        { title: 'Web Development Mastery', type: 'Course', duration: '12 Weeks', students: '1.2k' },
        { title: 'Digital Art Fundamentals', type: 'Course', duration: '8 Weeks', students: '800' },
        { title: 'Prisma & Next.js Core', type: 'Workshop', duration: '4 Hours', students: '500' },
    ];

    return (
        <PageShell
            category="The Academy"
            title="Education"
            subtitle="Deep dives into technical concepts, tutorials, and structured online courses for the modern creator."
            heroImage="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2000&auto=format&fit=crop"
        >
            <div className="space-y-24">
                {/* Courses Grid */}
                <div>
                    <div className="flex items-center justify-between mb-12 border-b border-slate-100 pb-4">
                        <h2 className="text-3xl font-medium text-slate-900 serif">Latest Courses</h2>
                        <span className="text-[10px] tracking-[.3em] font-bold text-slate-400 uppercase">Featured Study</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {courses.map((course) => (
                            <div key={course.title} className="group border border-slate-100 p-8 hover:border-blue-600 transition-colors">
                                <span className="text-[9px] tracking-[.2em] font-bold text-blue-600 uppercase mb-4 block">
                                    {course.type}
                                </span>
                                <h3 className="text-2xl font-medium serif text-slate-900 mb-6 group-hover:text-blue-600 transition-colors">
                                    {course.title}
                                </h3>
                                <div className="flex items-center space-x-6 text-slate-400 text-[10px] tracking-widest uppercase mb-8">
                                    <span className="flex items-center"><PlayCircle className="mr-1 h-3 w-3" /> {course.duration}</span>
                                    <span className="flex items-center"><BookOpen className="mr-1 h-3 w-3" /> {course.students} Learners</span>
                                </div>
                                <button className="text-[10px] tracking-[.3em] font-bold text-slate-900 uppercase underline decoration-slate-200 underline-offset-8 hover:decoration-blue-600 transition-all">
                                    Explore Curriculum
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="bg-slate-900 p-12 text-center">
                    <h3 className="text-3xl font-medium serif text-white mb-6">Start Your Learning Journey</h3>
                    <p className="text-slate-400 text-sm max-w-xl mx-auto mb-8 font-light leading-relaxed">
                        Whether you're starting from scratch or looking to master advanced concepts,
                        our curriculum is designed to help you grow.
                    </p>
                    <button className="bg-white text-slate-900 px-10 py-4 text-[10px] tracking-[.4em] font-bold uppercase hover:bg-blue-600 hover:text-white transition-all">
                        Join the Community
                    </button>
                </div>
            </div>
        </PageShell>
    );
}
