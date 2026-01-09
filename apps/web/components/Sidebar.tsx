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
import { motion, AnimatePresence, Variants } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { logout } from "@/services/auth/auth.api";
import { useUserStore } from "@/store/use-user-store";
import { ProfilePopup } from "./ProfilePopup";
import { StartupPreferencesPopup } from "./StartupPreferencesPopup";
import { getPersonalization, updateOnboarding } from "@/services/user/user.api";
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

const SIDEBAR_VARIANTS: Variants = {
  initial: { x: -350, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -350, opacity: 0 },
};

const TRANSITION = { type: "spring", damping: 25, stiffness: 200 };

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
    setAuthUser({ ...authUser, nickname: value });
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

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => onToggle(true)}
          className="fixed left-6 top-6 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-600 hover:text-gray-900 transition-all hover:scale-105"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            variants={SIDEBAR_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={TRANSITION}
            className="w-[350px] p-4 fixed h-full flex flex-col z-40"
          >
            <div className="bg-white rounded-2xl shadow-lg h-full flex flex-col overflow-hidden">
              <header className="h-16 px-6 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
                <span className="text-lg font-black text-slate-900 tracking-tight">Starter</span>
                <button
                  onClick={() => onToggle(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </header>

              <div className="px-4 py-4 border-b border-gray-100">
                <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors group">
                  <span className="group-hover:text-slate-900">New chat</span>
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-slate-600" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-3 overflow-y-auto no-scrollbar">
                <div className="space-y-1">
                  {MENU_ITEMS.map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => onMenuClick(id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeMenu === id
                          ? "bg-slate-100 text-slate-900 shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{label}</span>
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          activeMenu === id ? "text-slate-900" : "text-slate-400"
                        }`}
                      />
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
                              src="https://images.unsplash.com/photo-1649433658557-54cf58577c68?q=80&w=200&h=200&auto=format&fit=crop"
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{nickname}</p>
                          <p className="text-[11px] text-slate-400 font-medium truncate">Premium Member</p>
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
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span>로그인</span>
                      <LogIn className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
