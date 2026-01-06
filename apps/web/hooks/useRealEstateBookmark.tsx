'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useModalStore } from '@/stores/useModalStore';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export const useRealEstateBookmark = () => {
  const [loading, setLoading] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // 로그인 시 즐겨찾기 목록 불러오기
  const fetchBookmarks = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/real-estate-bookmark`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const ids = new Set<string>(
          data.map((item: { real_estate_id: string }) => item.real_estate_id),
        );
        setBookmarkedIds(ids);
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const isBookmarked = useCallback(
    (realEstateId: string): boolean => {
      return bookmarkedIds.has(realEstateId);
    },
    [bookmarkedIds],
  );

  const addBookmark = async (realEstateId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        useModalStore.getState().openModal({
          type: 'confirm',
          title: '로그인 필요',
          content:
            '로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?',
          confirmText: '로그인하기',
          onConfirm: () => {
            window.location.href = '/login';
          },
        });
        return false;
      }

      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/real-estate-bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ realEstateId }),
      });

      if (res.ok) {
        setBookmarkedIds((prev) => new Set(prev).add(realEstateId));
        toast.success('즐겨찾기에 추가되었습니다! ⭐');
        return true;
      } else {
        if (res.status === 409) {
          toast.error('이미 즐겨찾기된 매물입니다.');
        } else if (res.status === 401) {
          toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('accessToken');
        } else {
          toast.error('즐겨찾기 추가에 실패했습니다.');
        }
        return false;
      }
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      toast.error('오류가 발생했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (realEstateId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('로그인이 필요합니다.');
        return false;
      }

      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/real-estate-bookmark/${realEstateId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        setBookmarkedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(realEstateId);
          return newSet;
        });
        toast.success('즐겨찾기가 해제되었습니다.');
        return true;
      } else {
        toast.error('즐겨찾기 해제에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      toast.error('오류가 발생했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (realEstateId: string): Promise<boolean> => {
    if (isBookmarked(realEstateId)) {
      return removeBookmark(realEstateId);
    } else {
      return addBookmark(realEstateId);
    }
  };

  return {
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    loading,
    bookmarkedIds,
    refetch: fetchBookmarks,
  };
};
