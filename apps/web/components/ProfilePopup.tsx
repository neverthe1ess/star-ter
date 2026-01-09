"use client";

import {
  Camera,
  ChevronRight,
  LogOut,
  User,
  Shield,
  Bell,
  CreditCard,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type SettingsGroup = {
  title: string;
  items: { label: string; icon: LucideIcon }[];
};

const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    title: "Account",
    items: [
      { label: "프로필 편집", icon: User },
      { label: "보안 및 로그인", icon: Shield },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "알림 설정", icon: Bell },
      { label: "결제 관리", icon: CreditCard },
      { label: "고객 지원", icon: LifeBuoy },
    ],
  },
];

type ProfilePopupProps = {
  nickname: string;
  onNicknameChange: (value: string) => void;
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  logoutError: string | null;
};

export function ProfilePopup({
  nickname,
  onNicknameChange,
  onClose,
  onLogout,
  isLoggingOut,
  logoutError,
}: ProfilePopupProps) {
  return (
    <>
      <motion.div
        key="profile-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <motion.div
        key="profile-popup"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="fixed bottom-28 left-6 z-50 w-[calc(350px-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-50 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1649433658557-54cf58577c68?q=80&w=200&h=200&auto=format&fit=crop"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={nickname}
                onChange={(e) => onNicknameChange(e.target.value)}
                className="w-full text-lg font-black text-slate-900 bg-transparent border-none focus:ring-0 p-0 mb-0.5"
                placeholder="닉네임 입력"
              />
              <p className="text-xs font-bold text-blue-600">Premium Plan 사용 중</p>
            </div>
          </div>
        </div>

        <div className="p-2">
          {SETTINGS_GROUPS.map((group) => (
            <div key={group.title} className="mb-2">
              <p className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {group.title}
              </p>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="p-2 bg-slate-50 border-t border-gray-100">
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-500 hover:bg-white hover:shadow-sm rounded-xl transition-all disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
          {logoutError && <p className="px-2 pt-2 text-xs text-red-500">{logoutError}</p>}
        </div>
      </motion.div>
    </>
  );
}
