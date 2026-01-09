// import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from './header/Logo';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 px-6">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 mb-16">
          <div className="space-y-6">
            <Logo />
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Starter는 빅데이터와 AI 기술을 활용하여 예비 창업자와 소상공인에게
              가장 정밀한 상권 분석 정보를 제공합니다.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-2xl font-extrabold text-blue-900">
              서비스
            </h4>
            <ul className="flex gap-4 text-sm text-gray-500">
              <li>
                <button className="hover:text-blue-950 transition-colors">
                  상권 분석 리포트
                </button>
              </li>
              <li>
                <button className="hover:text-blue-950 transition-colors">
                  AI 창업 컨설팅
                </button>
              </li>
              <li>
                <button className="hover:text-blue-950 transition-colors">
                  부동산 정보 서비스
                </button>
              </li>
              <li>
                <button className="hover:text-blue-950 transition-colors">
                  상권 비교
                </button>
              </li>
              <li>
                <button className="hover:text-blue-950 transition-colors">
                  손익분기점 계산
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2026 Starter Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
