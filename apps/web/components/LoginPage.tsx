'use client';

import { useState } from "react";
import Link from "next/link";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Logo } from './landing/header/Logo';
import { login } from "@/services/auth/auth.api";
import { useUserStore } from "@/store/use-user-store";

interface LoginPageProps {
  onLogin: (result: { on_boarding_completed: boolean }) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setAuthUser = useUserStore((state) => state.setAuthUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await login({ email, password });
      setAuthUser({
        id: response.id,
        nickname: response.nickname,
        profileImageKey: response.profile_image_key ?? null,
      });
      onLogin({ on_boarding_completed: response.on_boarding_completed });
    } catch (err) {
      const message = err instanceof Error ? err.message : "로그인에 실패했습니다.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-xl p-12 w-full max-w-2xl">
        <div className="flex justify-center mb-10">
          <Logo className="h-16" />
        </div>

        <h2 className="text-3xl font-bold text-center mb-3">로그인</h2>
        <p className="text-gray-600 text-center mb-10 text-lg">
          상권 분석을 시작하세요
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-base font-medium mb-3">이메일</label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 text-base"
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-3">비밀번호</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 text-base"
            />
          </div>

          <div className="flex items-center justify-between text-base">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded w-4 h-4" />
              <span>로그인 상태 유지</span>
            </label>
            <a href="#" className="text-blue-950 hover:underline">
              비밀번호 찾기
            </a>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-950 hover:bg-slate-900 text-white py-7 text-lg"
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        <div className="mt-8 text-center">
          <span className="text-gray-600 text-base">계정이 없으신가요? </span>
          <Link href="/regist" className="text-blue-950 hover:underline font-medium text-base">
            회원가입
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t">
          <p className="text-center text-gray-600 mb-4 text-base">
            간편 로그인
          </p>
          <button className="w-full py-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-3 transition-all">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-base font-medium text-gray-700">
              Google로 계속하기
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
