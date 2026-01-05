'use client';

import { EstateRegistration } from '@/types/estate_registration-type';

interface PricingSectionProps {
  formData: EstateRegistration;
  onChange: (updates: Partial<EstateRegistration>) => void;
}

export default function PricingSection({ formData, onChange }: PricingSectionProps) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold mb-4">임대 조건</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* deposit, monthly_rent, maintenance_fee, premium 입력 필드 예정 */}
      </div>
    </section>
  );
}
