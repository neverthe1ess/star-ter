'use client';

import { useEffect, useState } from 'react';

interface NewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
  image?: string;
}

interface NewsSectionProps {
  region?: string;
  locationName?: string;
  showImages?: boolean;
  showPagination?: boolean;
}

export default function NewsSection({
  region,
  locationName,
  showImages = false,
  showPagination = false,
}: NewsSectionProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true); // Set loading to true when fetching new data
        const API_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        const targetRegion = region || '서울';
        const res = await fetch(
          `${API_URL}/news?region=${encodeURIComponent(
            targetRegion,
          )}&page=${page}&limit=5`,
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
  }, [region, page]);

  if (loading) return <div className="p-8 text-center">Loading news...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  const displayTitle = locationName || region;

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl">
          {displayTitle ? `${displayTitle} ` : ''}상권 뉴스
        </h2>
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
            <div className="group cursor-pointer flex gap-4">
              <div className="flex-1 min-w-0 flex flex-col">
                <h3
                  className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1"
                  dangerouslySetInnerHTML={{ __html: item.title }}
                />
                <p
                  className="text-gray-600 text-sm mb-3 line-clamp-1 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
                <div className="mt-auto text-xs text-gray-400">
                  {new Date(item.pubDate).toLocaleDateString()}
                </div>
              </div>

              {showImages && item.image && (
                <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={item.image}
                    alt="뉴스 썸네일"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </a>
        ))}
      </div>

      {showPagination && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              page === 1
                ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            이전
          </button>
          <span className="text-sm font-medium text-slate-600">
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={news.length === 0}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
