'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Home, PieChart, MessageSquare, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useModalStore } from '@/stores/useModalStore';

interface AppHeaderProps {
  className?: string;
}

export default function AppHeader({ className = '' }: AppHeaderProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { openModal } = useModalStore();

  const handleRealEstateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      router.push('/real-estate/register');
    } else {
      openModal({
        type: 'confirm',
        title: '로그인 필요',
        content: '부동산 등록을 위해서는 로그인이 필요합니다.',
        confirmText: '로그인',
        cancelText: '취소',
        onConfirm: () => {
          router.push('/login');
        },
      });
    }
  };

  return (
    <header className={`flex h-16 items-center justify-between border-b border-gray-200 px-6 bg-white ${className}`}>
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">M</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Star-ter with AI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
          <Link href="/" className="flex items-center gap-1 hover:text-gray-900">
            <Home className="h-4 w-4" /> 홈
          </Link>
          <Link href="#" className="flex items-center gap-1 hover:text-gray-900">
            <PieChart className="h-4 w-4" /> 상권분석
          </Link>
          <Link href="#" className="flex items-center gap-1 hover:text-gray-900">
            <MessageSquare className="h-4 w-4" /> 커뮤니티
          </Link>
          <button
            onClick={handleRealEstateClick}
            className="flex items-center gap-1 hover:text-gray-900"
          >
            <Building2 className="h-4 w-4" /> 부동산 등록
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="지역, 상권, 아파트 검색"
            className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        {isLoggedIn ? (
          <button 
            onClick={() => router.push('/user')}
            className="flex h-9 w-24 items-center justify-center rounded bg-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-300"
          >
            마이페이지
          </button>
        ) : (
          <button 
            onClick={() => router.push('/login')}
            className="flex h-9 w-24 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white hover:bg-blue-700"
          >
            로그인
          </button>
        )}
      </div>
    </header>
  );
}
