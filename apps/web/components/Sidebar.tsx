"use client";

import { useEffect, useState } from "react";
import {
  Home,
  FileText,
  Calendar,
  Plus,
  X,
  Settings,
  Menu,
  LogIn,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { logout } from "@/services/auth/auth.api";
import { useUserStore } from "@/store/use-user-store";
import { ProfilePopup } from "./ProfilePopup";
import { StartupPreferencesPopup } from "./StartupPreferencesPopup";
import { getPersonalization, updateOnboarding, updateProfile } from "@/services/user/user.api";
import type { OnboardingData } from "./onboarding/onboarding-options";

interface SidebarProps {
  activeMenu: string;
  onMenuClick: (id: string) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

const MENU_ITEMS = [
  { id: "home", icon: Home, label: "홈" },
  { id: "templates", icon: FileText, label: "상권 찾기" },
  { id: "meetings", icon: Calendar, label: "상세정보" },
] as const;

const COLLECTIONS = [
  { id: "hot", label: "여기서 치킨집 차리는거 어때?", color: "bg-gray-500" },
  { id: "stable", label: "손익분기 넘길라면 몇 년 걸려?", color: "bg-gray-500" },
] as const;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const DEFAULT_PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1649433658557-54cf58577c68?q=80&w=200&h=200&auto=format&fit=crop";

const getProfileImageUrl = (profileImageKey?: string | null) =>
  profileImageKey ? `${API_BASE_URL}/image/${encodeURIComponent(profileImageKey)}` : DEFAULT_PROFILE_IMAGE;

export function Sidebar({ activeMenu, onMenuClick, isOpen, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const authUser = useUserStore((state) => state.authUser);
  const clearAuthUser = useUserStore((state) => state.clearAuthUser);
  const setAuthUser = useUserStore((state) => state.setAuthUser);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showPreferencesPopup, setShowPreferencesPopup] = useState(false);
  const [nickname, setNickname] = useState(authUser?.nickname ?? "사용자");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [initialPreferences, setInitialPreferences] = useState<OnboardingData | undefined>();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setNickname(authUser?.nickname ?? "사용자");
  }, [authUser?.nickname]);

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    if (authUser) {
      setAuthUser({ ...authUser, nickname: value });
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setShowProfilePopup(false);
      setShowPreferencesPopup(false);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      clearAuthUser();
      setShowProfilePopup(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "로그아웃에 실패했습니다.";
      setLogoutError(message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleOpenPreferences = () => {
    setShowProfilePopup(false);
    setPreferencesError(null);
    setShowPreferencesPopup(true);
    setIsLoadingPreferences(true);
    getPersonalization()
      .then((data) => {
        setInitialPreferences(data);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "개인화 정보 조회에 실패했습니다.";
        setPreferencesError(message);
      })
      .finally(() => {
        setIsLoadingPreferences(false);
      });
  };

  const handleSavePreferences = async (data: OnboardingData) => {
    setIsSavingPreferences(true);
    setPreferencesError(null);
    try {
      await updateOnboarding(data);
      setShowPreferencesPopup(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "설정 저장에 실패했습니다.";
      setPreferencesError(message);
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!authUser) return;
    setIsSavingProfile(true);
    setProfileError(null);
    try {
      const response = await updateProfile({ nickname });
      setAuthUser({
        ...authUser,
        nickname: response.nickname ?? nickname,
        profileImageKey: response.profile_image_key ?? authUser.profileImageKey,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "프로필 저장에 실패했습니다.";
      setProfileError(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfileImageChange = (key: string) => {
    if (!authUser) return;
    setAuthUser({ ...authUser, profileImageKey: key });
  };

  const sidebarContainerClass = `fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out ${
    isOpen ? "w-[350px] p-4" : "w-20 px-3 py-4"
  }`;
  const sidebarHeaderClass = `h-16 flex items-center border-b border-gray-100 shrink-0 ${
    isOpen ? "px-6 justify-between" : "justify-center"
  }`;

  return (
    <>
      <div className={sidebarContainerClass}>
        <div className="bg-white rounded-2xl shadow-lg h-full flex flex-col overflow-hidden">
          <header className={sidebarHeaderClass}>
            {isOpen && (
              <span className="text-lg font-black text-slate-900 tracking-tight whitespace-nowrap">
                Starter
              </span>
            )}
            <button
              onClick={() => onToggle(!isOpen)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {isOpen ? (
            <>
              <div className="px-4 py-4 border-b border-gray-100">
                <button className="w-full min-w-0 flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors group">
                  <span className="min-w-0 truncate group-hover:text-slate-900">New chat</span>
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-slate-600" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-3 overflow-y-auto no-scrollbar">
                <div className="space-y-1">
                  {MENU_ITEMS.map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => onMenuClick(id)}
                      className={`w-full min-w-0 flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeMenu === id
                          ? "bg-slate-100 text-slate-900 shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          activeMenu === id ? "text-slate-900" : "text-slate-400"
                        }`}
                      />
                      <span className="min-w-0 truncate">{label}</span>
                    </button>
                  ))}
                </div>

                <div className="my-4 border-t border-gray-100" />

                <div className="space-y-1">
                  {COLLECTIONS.map(({ id, label, color }) => (
                    <button
                      key={id}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </nav>

              <footer className="px-4 py-4 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-3 px-2 py-2">
                  {authUser ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowProfilePopup((prev) => !prev)}
                        className="flex-1 min-w-0 flex items-center gap-3 text-left"
                        aria-label="Open profile settings"
                      >
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                            <ImageWithFallback
                              src={getProfileImageUrl(authUser?.profileImageKey)}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{nickname}</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setShowProfilePopup((prev) => !prev)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                        aria-label="Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
                        router.push(`/login${next}`);
                      }}
                      className="w-full min-w-0 flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span className="truncate">로그인</span>
                      <LogIn className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col px-2 py-3">
              <div className="flex flex-col items-center gap-2">
                {MENU_ITEMS.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => onMenuClick(id)}
                    className={`p-2 rounded-lg transition-colors ${
                      activeMenu === id
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    aria-label={label}
                    title={label}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>

              <div className="mt-auto flex flex-col items-center gap-2 pb-2">
                {authUser ? (
                  <button
                    type="button"
                    onClick={() => setShowProfilePopup((prev) => !prev)}
                    className="relative rounded-full border border-gray-100"
                    aria-label="Open profile settings"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden">
                      <ImageWithFallback
                        src={getProfileImageUrl(authUser?.profileImageKey)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
                      router.push(`/login${next}`);
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    aria-label="Login"
                    title="로그인"
                  >
                    <LogIn className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isMounted &&
        createPortal(
          <AnimatePresence>
            {showProfilePopup && (
              <ProfilePopup
                nickname={nickname}
                onNicknameChange={handleNicknameChange}
                onClose={() => setShowProfilePopup(false)}
                onOpenPreferences={handleOpenPreferences}
                onLogout={handleLogout}
                isLoggingOut={isLoggingOut}
                logoutError={logoutError}
                isSavingProfile={isSavingProfile}
                profileError={profileError}
                onSaveProfile={handleSaveProfile}
                profileImageKey={authUser?.profileImageKey}
                onProfileImageChange={handleProfileImageChange}
                isSidebarOpen={isOpen}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {showPreferencesPopup && (
              <StartupPreferencesPopup
                initialData={initialPreferences}
                onClose={() => setShowPreferencesPopup(false)}
                onSave={handleSavePreferences}
                isSaving={isSavingPreferences}
                isLoading={isLoadingPreferences}
                error={preferencesError}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
