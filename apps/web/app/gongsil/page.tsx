'use client';

import { useState } from 'react';
import { EstateRegistration } from '@/types/estate_registration-type';

export default function GongsilPage() {
  const [formData, setFormData] = useState<EstateRegistration>({
    user_id: '',
    address_name: '',
    address_road_name: '',
    address_x: 0,
    address_y: 0,
    deposit: '',
    monthly_rent: '',
    maintenance_fee: '',
    premium: '',
    price_per_pyeong: '',
    area: '',
    floor_info: '',
    phone_number: '',
    description: '',
    images: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('등록 시도:', formData);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold">공실 매물 등록</h1>
          <p className="text-gray-500 mt-2">등록 정보를 입력해 주세요.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. 주소 및 지도 미리보기 공간 (지도 왼쪽, 정보 오른쪽) */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 지도 미리보기 공간 (Placeholder) */}
            <div className="aspect-square w-full bg-gray-100 rounded-xl border-2 border-dashed flex items-center justify-center text-gray-400 order-2 md:order-1">
              <p>지도 미리보기 공간</p>
            </div>

            <div className="space-y-4 order-1 md:order-2">
              <h2 className="text-lg font-bold">위치 정보</h2>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="주소명 (지번)" 
                  className="w-full p-2 border rounded-md"
                  value={formData.address_name}
                  onChange={(e) => setFormData({...formData, address_name: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="도로명 주소" 
                  className="w-full p-2 border rounded-md"
                  value={formData.address_road_name}
                  onChange={(e) => setFormData({...formData, address_road_name: e.target.value})}
                />
              </div>
            </div>
          </section>


          {/* 2. 임대 및 매물 정보 */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">매물 정보</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input type="number" placeholder="보증금" className="p-2 border rounded" value={formData.deposit} onChange={(e) => setFormData({...formData, deposit: e.target.value})} />
              <input type="number" placeholder="월세" className="p-2 border rounded" value={formData.monthly_rent} onChange={(e) => setFormData({...formData, monthly_rent: e.target.value})} />
              <input type="number" placeholder="관리비" className="p-2 border rounded" value={formData.maintenance_fee} onChange={(e) => setFormData({...formData, maintenance_fee: e.target.value})} />
              <input type="number" placeholder="권리금" className="p-2 border rounded" value={formData.premium} onChange={(e) => setFormData({...formData, premium: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 py-4 border-t border-gray-50">
              <input type="number" placeholder="면적 (평)" className="p-2 border rounded" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} />
              <input type="text" placeholder="층 위치 (예: 2층, 5층)" className="p-2 border rounded" value={formData.floor_info} onChange={(e) => setFormData({...formData, floor_info: e.target.value})} />
              <input type="text" placeholder="연락처" className="md:col-span-2 p-2 border rounded" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
            </div>
          </section>

          {/* 3. 사진 업로드 및 설명 공간 */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-bold">사진 등록</h2>
            {/* 이미지 업로드 공간 (Placeholder) */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              <div className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-2xl text-gray-400 cursor-pointer">
                +
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <h2 className="text-lg font-bold mb-4">상세 설명</h2>
              <textarea 
                className="w-full p-3 border rounded-xl h-40 outline-none resize-none"
                placeholder="매물 설명을 입력하세요"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          </section>

          <button
            type="submit"
            className="w-full py-4 bg-purple-600 text-white font-bold text-lg rounded-xl shadow-lg"
          >
            등록 완료
          </button>
        </form>
      </div>
    </main>
  );
}
