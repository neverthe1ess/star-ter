import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Logo />
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Starter는 빅데이터와 AI 기술을 활용하여 예비 창업자와 소상공인에게 가장 정밀한 상권 분석 정보를 제공합니다.
            </p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-950 hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-950 hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-950 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-950 hover:text-white transition-all">
                <Youtube className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold mb-6">서비스</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <button className="hover:text-blue-950 transition-colors">상권 분석 리포트</button>
              </li>
              <li>
                <button className="hover:text-blue-950 transition-colors">AI 창업 컨설팅</button>
              </li>
              <li>
                <button className="hover:text-blue-950 transition-colors">매물 정보 서비스</button>
              </li>
              <li>
                <button className="hover:text-blue-950 transition-colors">프랜차이즈 비교</button>
              </li>
              <li>
                <button className="hover:text-blue-950 transition-colors">손익분기점 계산기</button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold mb-6">회사</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <button className="hover:text-blue-950 transition-colors">회사 소개</button>
              </li>
              <li>
                <button className="hover:text-blue-950 transition-colors">채용 정보</button>
              </li>
              <li>
                <button className="hover:text-blue-950 transition-colors">공지사항</button>
              </li>
              <li>
                <button className="hover:text-blue-950 transition-colors">이용약관</button>
              </li>
              <li>
                <button className="hover:text-blue-950 transition-colors text-blue-900 font-medium">
                  개인정보처리방침
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold mb-6">고객지원</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                <span>서울특별시 성동구 성수동2가 성수이로 123, 10층 (Starter빌딩)</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                <span>1588-1234 (평일 09:00~18:00)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                <span>support@starter.ai</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2026 Starter Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <button className="hover:text-gray-600">이용약관</button>
            <button className="hover:text-gray-600 font-medium">개인정보처리방침</button>
            <button className="hover:text-gray-600">위치기반서비스 이용약관</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
