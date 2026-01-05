'use client';

import { EstateRegistration } from '@/types/estate_registration-type';

interface ContentSectionProps {
  formData: EstateRegistration;
  onChange: (updates: Partial<EstateRegistration>) => void;
}

export default function ContentSection({ formData, onChange }: ContentSectionProps) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold mb-4">상세 설명 및 사진</h2>
      <div className="space-y-6">
        {/* description textarea 및 ImageUploader 컴포넌트 호출 예정 */}
      </div>
    </section>
  );
}
