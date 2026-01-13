"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github } from "lucide-react"; 
import { cn } from "./ui/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/regist";

  const handleGoogleLogin = () => {
    // 백엔드 Google 로그인 엔드포인트로 리디렉션
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 lg:p-8">
      <div className="w-[80vw] h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex relative">
        
        <div className="hidden md:flex w-[33%] bg-gradient-to-br from-slate-700 via-blue-950 to-slate-700 flex-col justify-between p-8 text-white relative z-10 transition-all duration-500 ease-in-out">
          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
             <div className="absolute top-[-10%] right-[-20%] w-[300px] h-[300px] rounded-full bg-white blur-3xl" />
             <div className="absolute bottom-[-10%] left-[-20%] w-[200px] h-[200px] rounded-full bg-slate-600 blur-3xl" />
          </div>

          <div className="space-y-10 relative z-10 -mt-3 -ml-2">
            <div className="space-y-1">
              <h2 className="text-lg font-bold tracking-tight">SNS Login</h2>
            </div>
            
            <div className="flex flex-col gap-8 font-medium text-white/80">
              <button onClick={handleGoogleLogin} className="flex items-center gap-3 hover:text-white transition-colors group text-left text-[14px]">
                <div className="w-6 flex justify-center">
                  <svg className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity fill-current" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </div>
                Google
              </button>
              <button onClick={() => {}} className="flex items-center gap-3 hover:text-white transition-colors group text-left text-[14px]">
                <div className="w-6 flex justify-center">
                  <Github className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                GitHub
              </button>
              <button onClick={() => {}} className="flex items-center gap-3 hover:text-white transition-colors group text-left text-[14px]">
                 <div className="w-6 flex justify-center">
                   <svg className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity fill-current" viewBox="0 0 24 24">
                     <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.682 2.545-.78 2.94-.122.49.178.483.376.351.155-.103 2.5-1.696 3.514-2.38.533.076 1.082.116 1.62.116 4.97 0 9-3.186 9-7.116C21 6.185 16.97 3 12 3z"/>
                   </svg>
                 </div>
                 Kakao
              </button>
              <button onClick={() => {}} className="flex items-center gap-3 hover:text-white transition-colors group text-left text-[14px]">
                 <div className="w-6 flex justify-center">
                   <svg className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity fill-current" viewBox="0 0 24 24">
                      <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
                   </svg>
                 </div>
                 Naver
              </button>
            </div>
          </div>

          {/* Sidebar Navigation Tabs - The 'Cutout' Design */}
          <div className="absolute right-0 top-4/9 -translate-y-1/2 flex flex-col items-end gap-2 z-20">
             <Link 
               href="/login"
               className={cn(
                 "py-5 pl-6 pr-6 text-base font-bold transition-all duration-300 ease-out select-none rounded-l-2xl flex items-center min-w-[80px] relative",
                 isLogin 
                  ? "bg-white text-slate-800 translate-x-[2px] z-30 before:absolute before:top-[-16px] before:right-0 before:h-[16px] before:w-[18px] before:bg-[radial-gradient(circle_at_0_0,transparent_15px,#fff_16.5px)] after:absolute after:bottom-[-16px] after:right-0 after:h-[16px] after:w-[18px] after:bg-[radial-gradient(circle_at_0_100%,transparent_15px,#fff_16.5px)]" 
                  : "text-white/70 hover:text-white hover:translate-x-[-4px] z-20"
               )}
             >
               로그인
             </Link>
             <Link 
               href="/regist"
               className={cn(
                 "py-5 pl-4 pr-4 text-base font-bold transition-all duration-300 ease-out select-none rounded-l-2xl flex items-center min-w-[80px] relative",
                 isRegister 
                   ? "bg-white text-slate-800 translate-x-[2px] z-30 before:absolute before:top-[-16px] before:right-0 before:h-[16px] before:w-[18px] before:bg-[radial-gradient(circle_at_0_0,transparent_15px,#fff_16.5px)] after:absolute after:bottom-[-16px] after:right-0 after:h-[16px] after:w-[18px] after:bg-[radial-gradient(circle_at_0_100%,transparent_15px,#fff_16.5px)]" 
                  : "text-white/70 hover:text-white hover:translate-x-[-4px] z-20"
               )}
             >
               회원가입
             </Link>
          </div>

          <div className="text-[10px] text-white/75 relative z-10 -mb-4 -ml-3">
             Copyright © 2026 Starter Web
          </div>
        </div>

        {/* Mobile Tab Fallback */}
        <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-white z-20 flex border-b">
           <Link href="/login" className={cn("flex-1 flex items-center justify-center font-medium", isLogin ? "text-slate-800 border-b-2 border-slate-800" : "text-gray-500")}>
             Login
           </Link>
           <Link href="/regist" className={cn("flex-1 flex items-center justify-center font-medium", isRegister ? "text-slate-800 border-b-2 border-slate-800" : "text-gray-500")}>
             Sign in
           </Link>
        </div>


        {/* Right Content */}
        <div className="flex-1 bg-white p-8 md:p-12 lg:p-16 flex flex-col justify-center items-center relative pt-20 md:pt-12">
           {children}
        </div>

      </div>
    </div>
  );
}
