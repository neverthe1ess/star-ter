"use client";

import { useState } from "react";
import { Lock, Mail } from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { login } from "@/services/auth/auth.api";
import { useUserStore } from "@/store/use-user-store";
import { AuthLayout } from "./AuthLayout";

interface LoginPageProps {
  onLogin: (result: { on_boarding_completed: boolean }) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:4000/auth/google';
  };

  return (
    <AuthLayout>
      <div className="w-[37%] flex flex-col items-center">
        <div className="mb-6 text-center -mt-8">
          <div className="w-38 h-38 mx-auto relative flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <svg viewBox="-10 -10 120 120" className="w-full h-full drop-shadow-md">
                <defs>
                  <linearGradient id="hexagonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#65439fff" />
                    <stop offset="100%" stopColor="#090647ff" />
                  </linearGradient>
                </defs>
                <path 
                  d="M50 0 L93.3 25 V75 L50 100 L6.7 75 V25 Z" 
                  fill="url(#hexagonGradient)" 
                  stroke="url(#hexagonGradient)"
                  strokeWidth="15"
                  strokeLinejoin="round"
                />
              </svg>
              
              {/* Inner White Circle */}
              <div className="absolute w-[72%] h-[72%] bg-white rounded-full flex items-center justify-center shadow-inner">
                {/* Checkmark Icon */}
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="url(#checkmarkGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                     <linearGradient id="checkmarkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#65439fff" />
                        <stop offset="100%" stopColor="#090647ff" />
                     </linearGradient>
                  </defs>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-[44px] bg-clip-text text-transparent bg-gradient-to-r from-[#65439f] to-[#090647] font-bold tracking-tight">
            지리응답
          </h1>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="space-y-6">
            <div className="relative flex items-end gap-3">
               <Mail className="absolute left-0 bottom-3.5 w-4 h-4 text-slate-400" />
               <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 border-0 border-b-[3px] border-slate-300/40 rounded-none px-0 pl-6 focus-visible:ring-0 focus-visible:border-slate-600 placeholder:text-gray-400 bg-transparent text-sm transition-colors"
               />
            </div>
            
            <div className="relative flex items-end gap-3">
               <Lock className="absolute left-0 bottom-3.5 w-4 h-4 text-slate-400" />
               <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 border-0 border-b-[3px] border-slate-300/40 rounded-none px-0 pl-6 focus-visible:ring-0 focus-visible:border-slate-600 placeholder:text-gray-400 bg-transparent text-sm pr-8 transition-colors"
               />
               <button 
                 type="button" 
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-0 bottom-3 text-gray-400 hover:text-gray-600"
               >
                 {showPassword ? (
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.44 0 .87-.03 1.28-.09"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                 ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                 )}
               </button>
            </div>
          </div>
          
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-slate-700 hover:bg-blue-950 text-white font-medium rounded-lg shadow-lg shadow-slate-200 transition-all text-sm tracking-wide"
            >
              {isSubmitting ? "Logging in..." : "로그인"}
            </Button>
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </form>

        <div className="mt-12 w-full flex justify-between items-center text-xs font-semibold text-gray-500 px-2">
           
          
             
        </div>
      </div>
    </AuthLayout>
  );
}
