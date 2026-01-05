'use client';

import { EstateRegistration } from '@/types/estate_registration-type';

interface LocationSectionProps {
  formData: EstateRegistration;
  onChange: (updates: Partial<EstateRegistration>) => void;
}

export default function LocationSection({ formData, onChange }: LocationSectionProps) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold mb-4">위치 정보</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 주소 입력 및 지도 미리보기 영역 */}
        <div className="space-y-4">
          {/* address_name, address_road_name 입력 필드 예정 */}
        </div>
        <div className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed flex items-center justify-center">
          {/* MapPreview 컴포넌트 호출 예정 */}
          지도 미리보기
        </div>
      </div>
    </section>
  );
}
