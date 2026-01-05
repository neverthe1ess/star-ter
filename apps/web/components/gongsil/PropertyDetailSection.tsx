'use client';

import { EstateRegistration } from '@/types/estate_registration-type';

interface PropertyDetailSectionProps {
  formData: EstateRegistration;
  onChange: (updates: Partial<EstateRegistration>) => void;
}

export default function PropertyDetailSection({ formData, onChange }: PropertyDetailSectionProps) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold mb-4">매물 상세</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* area, floor_info, phone_number 입력 필드 예정 */}
      </div>
    </section>
  );
}
