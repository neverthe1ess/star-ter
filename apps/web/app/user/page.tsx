'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  LogOut,
  Star,
  Trash2,
  Building2,
  MapPin,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

import { useAuth } from '@/hooks/useAuth';
import { useModalStore } from '@/stores/useModalStore';

interface RealEstateItem {
  id: string;
  name: string | null;
  address: string | null;
  roadaddress: string | null;
  deposit: number | null;
  monthlyrent: number | null;
  premium: number | null;
  size: number | null;
  previewphotourl: string | null;
  title?: string | null;
}

interface RealEstateBookmark {
  id: string;
  user_id: string;
  real_estate_id: string;
  created_at: string;
  real_estate_info: RealEstateItem;
}

export default function UserPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<{
    nickname: string;
    email: string;
    createdAt: string;
  } | null>(null);
  const [myRealEstates, setMyRealEstates] = useState<RealEstateItem[]>([]);
  const [realEstateLoading, setRealEstateLoading] = useState(false);

  // 부동산 즐겨찾기 상태
  const [realEstateBookmarks, setRealEstateBookmarks] = useState<
    RealEstateBookmark[]
  >([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.status === 401) {
          toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
          handleLogout();
          return;
        }

        if (!res.ok) throw new Error('Failed to fetch profile');

        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error(error);
        toast.error('회원 정보를 불러오지 못했습니다.');
      }
    };

    const fetchMyRealEstates = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        setRealEstateLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/real-estate/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) throw new Error('Failed to fetch real estates');

        const data = await res.json();
        setMyRealEstates(data);
      } catch (error) {
        console.error(error);
      } finally {
        setRealEstateLoading(false);
      }
    };

    // 부동산 즐겨찾기 가져오기
    const fetchRealEstateBookmarks = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        setBookmarksLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/real-estate-bookmark`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) throw new Error('Failed to fetch bookmarks');

        const data = await res.json();
        setRealEstateBookmarks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setBookmarksLoading(false);
      }
    };

    if (mounted && isLoggedIn) {
      fetchProfile();
      fetchMyRealEstates();
      fetchRealEstateBookmarks();
    } else if (mounted && !isLoggedIn) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
    }
  }, [mounted, isLoggedIn, router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    toast.success('로그아웃 되었습니다.');
    window.location.href = '/';
  };

  const { openModal } = useModalStore();

  const handleRemoveBookmark = (realEstateId: string) => {
    openModal({
      type: 'confirm',
      title: '즐겨찾기 삭제',
      content: '정말로 이 매물을 즐겨찾기에서 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/real-estate-bookmark/${realEstateId}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (res.ok) {
            setRealEstateBookmarks((prev) =>
              prev.filter((b) => b.real_estate_id !== realEstateId),
            );
            toast.success('즐겨찾기가 삭제되었습니다.');
          } else {
            toast.error('삭제에 실패했습니다.');
          }
        } catch (error) {
          console.error(error);
          toast.error('오류가 발생했습니다.');
        }
      },
    });
  };

  const formatPrice = (price: number | string | null) => {
    if (!price) return '-';
    const numPrice = typeof price === 'string' ? parseInt(price) : price;
    const won = numPrice * 1000;
    if (won >= 100000000) {
      return `${(won / 100000000).toFixed(1)}억원`;
    } else if (won >= 10000) {
      return `${Math.round(won / 10000).toLocaleString()}만원`;
    }
    return `${won.toLocaleString()}원`;
  };

  if (!mounted || !isLoggedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header (간단한 뒤로가기 + 타이틀) */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">메인으로</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            {profile ? (
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {profile.nickname}님, 안녕하세요!
                </h2>
                <p className="text-gray-500 text-sm">{profile.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(profile.createdAt).toLocaleDateString()} 가입
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            )}
            <div className="flex gap-4">
              <div className="text-center px-5 py-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {myRealEstates.length}
                </p>
                <p className="text-xs text-gray-500">등록 부동산</p>
              </div>
              <div className="text-center px-5 py-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {realEstateBookmarks.length}
                </p>
                <p className="text-xs text-gray-500">즐겨찾기</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Content */}
        <div className="grid grid-cols-2 gap-6">
          {/* My Real Estate */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">내 등록 부동산</h3>
              </div>
              <Link
                href="/real-estate/register"
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
              >
                <Plus className="h-3 w-3" /> 등록
              </Link>
            </div>

            <div className="p-4 max-h-150 overflow-auto">
              {realEstateLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"></div>
                </div>
              ) : myRealEstates.length > 0 ? (
                <div className="space-y-3">
                  {myRealEstates.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors cursor-pointer"
                    >
                      {item.previewphotourl ? (
                        <Image
                          src={item.previewphotourl}
                          alt={item.name || '부동산'}
                          width={80}
                          height={60}
                          className="rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-15 rounded bg-gray-100 flex items-center justify-center shrink-0">
                          <Building2 className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {item.name || '이름 없음'}
                        </h4>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {item.roadaddress || item.address || '주소 없음'}
                        </p>
                        <div className="flex gap-2 mt-1.5">
                          <span className="text-xs font-medium text-blue-600">
                            보증금 {formatPrice(item.deposit)}
                          </span>
                          <span className="text-xs text-gray-300">|</span>
                          <span className="text-xs font-medium text-indigo-600">
                            월세 {formatPrice(item.monthlyrent)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Building2 className="h-10 w-10 mx-auto text-gray-200" />
                  <p className="mt-2 text-sm text-gray-500">
                    등록한 부동산이 없습니다
                  </p>
                  <Link
                    href="/real-estate/register"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus className="h-4 w-4" /> 부동산 등록하기
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bookmarks */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 p-4 border-b border-gray-100">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h3 className="font-bold text-gray-900">즐겨찾기 매물</h3>
            </div>

            <div className="p-4 max-h-150 overflow-auto">
              {bookmarksLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-yellow-500"></div>
                </div>
              ) : realEstateBookmarks.length > 0 ? (
                <div className="space-y-3">
                  {realEstateBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-yellow-200 hover:bg-yellow-50/50 transition-colors"
                    >
                      {bookmark.real_estate_info?.previewphotourl ? (
                        <Image
                          src={bookmark.real_estate_info.previewphotourl}
                          alt={bookmark.real_estate_info.name || '매물'}
                          width={80}
                          height={60}
                          className="rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-15 rounded bg-gray-100 flex items-center justify-center shrink-0">
                          <Building2 className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {bookmark.real_estate_info?.title ||
                            bookmark.real_estate_info?.name ||
                            '이름 없음'}
                        </h4>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {bookmark.real_estate_info?.roadaddress ||
                            bookmark.real_estate_info?.address ||
                            '주소 없음'}
                        </p>
                        <div className="flex gap-2 mt-1.5">
                          <span className="text-xs font-medium text-blue-600">
                            보증금{' '}
                            {formatPrice(bookmark.real_estate_info?.deposit)}
                          </span>
                          <span className="text-xs text-gray-300">|</span>
                          <span className="text-xs font-medium text-indigo-600">
                            월세{' '}
                            {formatPrice(
                              bookmark.real_estate_info?.monthlyrent,
                            )}
                          </span>
                          <span className="text-xs text-gray-300">|</span>
                          <span className="text-xs font-medium text-orange-600">
                            권리금{' '}
                            {formatPrice(
                              bookmark.real_estate_info?.premium || 0,
                            )}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleRemoveBookmark(bookmark.real_estate_id)
                        }
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all self-start"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Star className="h-10 w-10 mx-auto text-gray-200" />
                  <p className="mt-2 text-sm text-gray-500">
                    즐겨찾기한 매물이 없습니다
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
