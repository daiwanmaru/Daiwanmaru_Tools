'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const categories = [
    { name: 'Tools', href: '/tools' },
    { name: 'Education', href: '/education' },
    { name: 'Artworks', href: '/artworks' },
    { name: 'Products', href: '/products' }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] bg-white relative overflow-hidden font-sans">
      {/* Hero Section (Above the fold) */}
      <section className="min-h-[calc(100vh-140px)] flex flex-col justify-center relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 w-full flex flex-col lg:flex-row items-center justify-between py-16 md:py-32 relative z-10">

          {/* Left Side: Welcome Text */}
          <div className="lg:w-1/2 space-y-10 mb-20 lg:mb-0 text-left">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-medium text-slate-900 serif leading-[1.1]">
                Welcome to <br />
                <span className="text-slate-400">daiwanmaru.com</span>
              </h1>
            </div>

            <div className="max-w-md space-y-6">
              <p className="text-xl md:text-2xl text-slate-600 font-light leading-relaxed serif italic">
                "This is a place I display all my works and ideas. There are currently four categories:"
              </p>
              <div className="w-16 h-[1px] bg-slate-200"></div>
              <button
                onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center space-x-3 text-[10px] tracking-[.3em] font-bold text-slate-900 hover:text-blue-600 transition-colors group uppercase"
              >
                <span>The Story of Daiwan-kun</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Side: 2x2 Grid */}
          <div className="lg:w-1/2 w-full max-w-xl self-center lg:self-auto px-4 md:px-0">
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8">
              {categories.map((cat) => (
                <Link key={cat.name} href={cat.href} className="group relative">
                  <div className="aspect-square border border-slate-100 bg-slate-50/30 flex flex-col items-center justify-center p-8 transition-all duration-700 group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] group-hover:-translate-y-2">
                    <h3 className="text-xl md:text-3xl font-medium text-slate-900 serif transition-transform duration-500 group-hover:scale-110">
                      {cat.name}
                    </h3>
                    <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      <span className="text-[9px] tracking-[.4em] font-bold text-blue-600 uppercase font-sans">Explore</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mascot: Daiwan-kun Emerging from bottom-left */}
        <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 opacity-10 hover:opacity-100 transition-all duration-1000 pointer-events-none md:pointer-events-auto z-0 group hidden md:block">
          <img
            src="/logo-icon.png"
            alt="Daiwan-kun Mascot"
            className="w-full h-full object-contain object-left-bottom transform translate-y-20 -translate-x-20 group-hover:translate-y-4 group-hover:-translate-x-4 transition-transform duration-700 ease-out grayscale hover:grayscale-0"
          />
        </div>
      </section>

      {/* About Section (Below the fold) */}
      <section id="about-section" className="py-32 px-6 sm:px-12 lg:px-20 bg-slate-50/50 relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-medium text-slate-900 serif mb-8">Who is Daiwanmaru?</h2>
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-8">
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light serif">
              Hi! I am Daiwanmaru, a creator from Taiwan, building, exploring, and creating with AI.
              As a solopreneur and digital creator, I move between creativity and technology — working across marketing, software, music, illustration, and game design.
            </p>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light serif">
              Right now, the journey is about creating full-time, experimenting freely, and seeing how far AI can stretch personal imagination and limits.
            </p>

            <div className="pt-12 flex justify-center">
              <div className="w-16 h-[1px] bg-blue-600"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Subtle Background Elements */}
      <div className="absolute -top-20 -right-20 w-[40rem] h-[40rem] bg-slate-50 rounded-full blur-[100px] -z-10 opacity-30"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.1] -z-20"></div>
    </div>
  );
}
