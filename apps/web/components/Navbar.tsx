import Link from "next/link";

import { Button } from "./ui/button";
import { Logo } from "./Logo";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {/* 랜딩페이지 헤더 내용 */}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="default"
            className="bg-blue-950 hover:bg-slate-900 text-white px-6"
          >
            <Link href="/login">시작하기</Link>
          </Button>
          <Button asChild variant="outline" className="px-6">
            <Link href="/login">로그인</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
