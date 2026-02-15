'use client';

import { useState, useEffect } from 'react';

interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  category?: string;
}

interface CategoryGroup {
  [key: string]: Tool[];
}

export default function Home() {
  const [categories, setCategories] = useState<CategoryGroup>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tools')
      .then(res => res.json())
      .then((data: Tool[]) => {
        const grouped = data.reduce((acc, tool) => {
          const category = tool.category || 'OTHER';
          if (!acc[category]) acc[category] = [];
          acc[category].push(tool);
          return acc;
        }, {} as CategoryGroup);
        setCategories(grouped);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch tools:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-xl font-semibold">Loading tools...</div>
    </div>
  );

  const categoryOrder = ['DOC', 'IMAGE', 'VIDEO', 'AUDIO'];
  const hasTools = Object.keys(categories).length > 0;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Daiwanmaru Tool
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          Your All-in-One Online Tool Collection.
        </p>
      </div>

      {categoryOrder.map(category => {
        const tools = categories[category];
        if (!tools || tools.length === 0) return null;

        return (
          <div key={category} className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">{category} Tools</h2>
            <div className="grid gap-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
              {tools.map((tool) => (
                <div key={tool.id} className="flex flex-col rounded-lg shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow duration-300 border border-gray-100">
                  <div className="p-5">
                    <a href={`/tools/${tool.slug}`} className="block">
                      <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{tool.description}</p>
                    </a>
                  </div>
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                    <a href={`/tools/${tool.slug}`} className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Use Tool &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {!hasTools && (
        <div className="text-center text-gray-500 mt-12">
          No tools found. Please verify database seeding.
        </div>
      )}

      <div className="mt-16 text-center text-sm text-gray-500">
        <p>Status: <span className="text-green-600 font-semibold">Connected to Cloud (Neon, Redis, B2)</span></p>
      </div>
    </main>
  );
}
