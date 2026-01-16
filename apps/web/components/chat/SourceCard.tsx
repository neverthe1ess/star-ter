'use client';

import { ExternalLink } from 'lucide-react';

/**
 * SourceCard 컴포넌트 - 출처 정보 카드
 *
 * 작은 단위 컴포넌트:
 * - 단일 책임 원칙: 하나의 출처 정보만 표시
 * - 재사용성: 여러 곳에서 동일한 UI로 사용 가능
 */

interface Source {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  number: number;
}

interface SourceCardProps {
  source: Source;
}

export function SourceCard({ source }: SourceCardProps) {
  // URL에서 도메인 추출
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 bg-background rounded-xl border border-border hover:border-primary/50 hover:shadow-sm transition-all group min-w-[180px]"
    >
      {/* 파비콘 또는 기본 아이콘 */}
      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0">
        {source.favicon ? (
          <img
            src={source.favicon}
            alt=""
            className="w-4 h-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* 출처 정보 */}
      <div className="flex-1 min-w-0">
        <p className="text-caption font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {source.title}
        </p>
        <p className="text-tiny text-muted-foreground flex items-center gap-1.5">
          <span className="w-3 h-3 bg-primary/10 rounded-sm flex items-center justify-center">
            <span className="text-tiny font-bold text-primary">★</span>
          </span>
          {getDomain(source.url)} • {source.number}
        </p>
      </div>
    </a>
  );
}

// "+N More" 버튼 컴포넌트
export function SourceMoreButton({ count }: { count: number }) {
  return (
    <button className="flex items-center justify-center px-4 py-3 bg-background rounded-xl border border-border hover:border-primary/50 hover:bg-muted transition-all text-caption text-muted-foreground font-medium min-w-[100px]">
      +{count} More
    </button>
  );
}
