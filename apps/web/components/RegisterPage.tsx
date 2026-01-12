"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { regist } from "@/services/auth/auth.api";

interface RegisterPageProps {
  onRegister: () => void;
}

export function RegisterPage({ onRegister }: RegisterPageProps) {
  
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      await regist({ email, password, nickname });
      onRegister();
    } catch (err) {
      const message = err instanceof Error ? err.message : "회원가입에 실패했습니다.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
     window.location.href = 'http://localhost:4000/auth/google';
  };

  const handleGuestLogin = () => {
      console.log("Guest login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_#CCF6FB_0%,_#E0F2FE_40%,_#FFFFFF_100%)]">
      <div className="bg-white rounded-lg shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] w-full max-w-5xl flex overflow-hidden min-h-[540px] max-h-[540px]">
        {/* Left Column: Register Form */}
        <div className="w-1/2 p-12 flex flex-col justify-center border-r border-gray-100">
          <div className="flex justify-center mb-8">
             <div className="flex flex-col items-center gap-2">
                <span className="text-4xl font-bold text-[#1e2b5e]">회원가입</span>
                <span className="text-gray-500 text-sm">서비스 이용을 위해 계정을 생성해주세요</span>
             </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-3 w-full max-w-sm mx-auto">
            <div>
              <Input
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className="h-11 text-base bg-white border-gray-300 focus:!border-blue-900 focus:!ring-blue-900 rounded-md"
              />
            </div>

            <div>
              <Input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 text-base bg-white border-gray-300 focus:!border-blue-900 focus:!ring-blue-900 rounded-md"
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 text-base bg-white border-gray-300 focus:!border-blue-900 focus:!ring-blue-900 rounded-md"
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 text-base bg-white border-gray-300 focus:!border-blue-900 focus:!ring-blue-900 rounded-md"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1e2b5e] hover:bg-[#151f45] text-white h-11 text-base rounded-md font-medium transition-colors mt-2"
            >
              {isSubmitting ? "가입 중..." : "회원가입"}
            </Button>
            
            {error && <p className="text-sm text-red-600 text-center mt-2">{error}</p>}

            <div className="text-center mt-4">
              <span className="text-gray-500 text-sm mr-2">이미 계정이 있으신가요?</span>
              <Link href="/login" className="text-sm text-[#1e2b5e] hover:underline font-medium">
                로그인
              </Link>
            </div>
          </form>
        </div>

        {/* Right Column: Social / Guest Login (Consistent with Login Page or decorative) */}
        <div className="w-1/2 p-16 flex flex-col justify-center items-center bg-white">
          <div className="w-full max-w-xs space-y-4 text-center">
            <h3 className="text-gray-900 font-[500] text-[14px]">Sign Up with</h3>
            
            <div className="space-y-16 flex flex-col items-center">
              <button 
                type="button"
                className="w-24 bg-white border border-gray-300 rounded-md h-10 flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors"
                onClick={handleGoogleLogin}
              >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span className="text-gray-700 font-medium text-[15px]">Google</span>
              </button>

              <button 
                type="button"
                className="w-36 bg-[#dbeafe] hover:bg-[#bfdbfe] text-slate-700 text-[15px] border border-transparent rounded-md h-10 flex items-center justify-center font-[500] transition-colors"
                onClick={handleGuestLogin}
              >
                손님으로 시작
              </button>
            </div>

            <div className="pt-0">
               <a href="#" className="flex items-center justify-center gap-2 text-sm text-[#1e2b5e] font-medium hover:underline">
                    <span className="bg-[#1e2b5e] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">?</span>
                    쿠키 공지
               </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
