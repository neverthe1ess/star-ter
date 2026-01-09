import Link from 'next/link';

import { Button } from '../../ui/button';
import { Logo } from './Logo';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />

        {/* TODO: 로그인 했을 떄랑 안했을 떄 차이 둬야해 */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="px-6 text-blue-900 border-blue-900 bg-white"
          >
            <Link href="/login">로그인</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
