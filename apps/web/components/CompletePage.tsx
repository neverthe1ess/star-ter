'use client';

import { Button } from './ui/button';
import {
  CheckCircle,
  Sparkles,
  Calendar,
  FileText,
  CreditCard,
} from 'lucide-react';
import { Logo } from './landing/header/Logo';

interface CompletePageProps {
  onRestart: () => void;
}

export function CompletePage({ onRestart }: CompletePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <div className="flex justify-center mb-6">
            <Logo className="h-10" />
          </div>

          <h1 className="text-4xl font-bold mb-4">창업 준비 완료!</h1>
          <p className="text-gray-600 text-lg mb-8">
            모든 분석과 계산이 완료되었습니다.
            <br />
            이제 실제 창업을 위한 다음 단계를 진행하세요.
          </p>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-lg mb-4">다음 단계</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-950 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <div className="font-medium">부동산 계약</div>
                  <div className="text-sm text-gray-600">
                    선택한 매물의 임대차 계약 진행
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-950 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <div className="font-medium">사업자 등록</div>
                  <div className="text-sm text-gray-600">
                    관할 세무서에서 사업자등록증 발급
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-950 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <div className="font-medium">인테리어 & 준비</div>
                  <div className="text-sm text-gray-600">
                    매장 인테리어 및 물품 구매
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-950 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <div className="font-medium">오픈 준비</div>
                  <div className="text-sm text-gray-600">
                    시운전 및 마케팅 준비
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-800 transition-all">
              <Calendar className="w-8 h-8 text-blue-800 mx-auto mb-2" />
              <div className="text-sm font-medium">일정 관리</div>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-800 transition-all">
              <FileText className="w-8 h-8 text-blue-800 mx-auto mb-2" />
              <div className="text-sm font-medium">서류 체크리스트</div>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-800 transition-all">
              <CreditCard className="w-8 h-8 text-blue-800 mx-auto mb-2" />
              <div className="text-sm font-medium">대출 상담</div>
            </button>
          </div>

          <div className="space-y-3">
            <Button className="w-full bg-blue-950 hover:bg-slate-900 text-white py-6 text-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              분석 리포트 다운로드
            </Button>
            <Button
              onClick={onRestart}
              variant="outline"
              className="w-full py-6"
            >
              처음부터 다시 시작하기
            </Button>
          </div>
        </div>

        <div className="text-center mt-6 text-gray-600">
          <p className="text-sm">
            창업 과정에서 궁금한 점이 있으시면 언제든지 문의해주세요!
          </p>
        </div>
      </div>
    </div>
  );
}
