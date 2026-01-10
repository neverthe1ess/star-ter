'use client';

import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface NewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface NewsSectionProps {
  region?: string;
}

export default function NewsSection({ region }: NewsSectionProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        const targetRegion = region || '서울';
        const res = await fetch(
          `${API_URL}/news?region=${encodeURIComponent(targetRegion)}`,
        );
        if (!res.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await res.json();
        if (data.items) {
          setNews(data.items);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [region]);

  if (loading) return <div className="p-8 text-center">Loading news...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl">
          {region ? `${region} ` : ''}상권 뉴스
        </h2>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex flex-col justify-between mb-8">
        {news.map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="nooper noreferrer"
            className="block h-full group pb-4"
          >
            <div className="group cursor-pointer">
              <h3
                className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1"
                dangerouslySetInnerHTML={{ __html: item.title }}
              />
              <p
                className="text-gray-600 text-sm mb-2 flex-1 line-clamp-1"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
              <div className="mt-auto text-xs text-gray-400">
                {new Date(item.pubDate).toLocaleDateString()}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
