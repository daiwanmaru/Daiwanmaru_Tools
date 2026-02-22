import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const sections = [
    {
      title: 'Tools',
      category: 'UTILITIES',
      description: 'The original Daiwanmaru Tools collection.',
      href: '/tools',
      image: 'https://images.unsplash.com/photo-1586769852044-692d1e27056e?q=80&w=2000&auto=format&fit=crop',
      date: 'Feb 22, 2026',
      readTime: 'Latest Update'
    },
    {
      title: 'Education',
      category: 'KNOWLEDGE',
      description: 'Technical articles, tutorials, and online courses.',
      href: '/education',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop',
      date: 'Feb 21, 2026',
      readTime: 'Course 01'
    },
    {
      title: 'Artworks',
      category: 'CREATIVE',
      description: 'Visual, audio, and video creations.',
      href: '/artworks',
      image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2000&auto=format&fit=crop',
      date: 'Feb 20, 2026',
      readTime: 'Artist Project'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Featured Entry Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative border border-slate-200 p-1 md:p-2">
            {/* Tag Label */}
            <div className="absolute top-0 left-0 bg-white border border-slate-200 px-6 py-2 -translate-y-1/2 ml-4 md:ml-8">
              <span className="tracking-editorial text-slate-900 font-medium">Featured Entry</span>
            </div>

            {/* Featured Image Container */}
            <div className="aspect-[21/9] overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2000&auto=format&fit=crop"
                alt="Featured"
                className="w-full h-full object-cover grayscale-[20%] hover:scale-105 transition-transform duration-1000"
              />
            </div>

            {/* Content Below Image */}
            <div className="pt-10 pb-6 px-4 md:px-8 max-w-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-blue-600 text-[10px] font-bold tracking-[.25em] uppercase">Admin</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 text-[10px] tracking-widest uppercase">Feb 22, 2026</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-medium text-slate-900 serif mb-6 leading-tight">
                Welcome to Daiwanmaru: <br /> The Intersection of Tech & Art.
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8 font-light text-lg">
                Dive into our comprehensive toolbox, explore our technical guides, or witness
                the evolution of virtual artistry. Everything starts here.
              </p>
              <Link href="/about" className="group inline-flex items-center text-xs tracking-[.3em] uppercase font-bold text-slate-900 hover:text-blue-600 transition-colors">
                Read More <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Sections */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {sections.map((section) => (
              <div key={section.title} className="group cursor-pointer">
                <Link href={section.href}>
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100 mb-6">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-blue-600 text-[9px] font-bold tracking-[.2em] uppercase">{section.category}</span>
                  </div>
                  <h3 className="text-2xl font-medium text-slate-900 serif mb-3 group-hover:text-blue-600 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                    {section.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 tracking-widest uppercase">{section.date}</span>
                    <span className="text-[9px] text-slate-400 tracking-widest uppercase">{section.readTime}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
