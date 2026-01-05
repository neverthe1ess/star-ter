'use client';

import { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Wallet,
  ArrowLeft,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { realEstateService } from '@/services/real-estate/real-estate.service';

declare global {
  interface Window {
    daum: any;
    kakao: any;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const [kakaoLoaded, setKakaoLoaded] = useState(false);
  const [formData, setFormData] = useState({
    address_name: '',
    address_road_name: '',
    address_x: '',
    address_y: '',
    deposit: '',
    monthly_rent: '',
    maintenance_fee: '',
    premium: '',
    price_per_pyeong: '',
    area: '',
    floor_info: '',
    phone_number: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalAddressX = formData.address_x;
    let finalAddressY = formData.address_y;

    // 좌표가 없지만 주소는 있는 경우 재시도
    if ((!finalAddressX || !finalAddressY) && formData.address_road_name) {
      try {
        toast.loading('위치 정보를 변환 중입니다...');
        const coords = await getCoords(formData.address_road_name);
        finalAddressX = String(coords.lat);
        finalAddressY = String(coords.lng);
        toast.dismiss();
      } catch {
        toast.dismiss();
        toast.error('주소의 위치 정보를 찾을 수 없습니다. 다시 검색해주세요.');
        return;
      }
    }

    if (!finalAddressX || !finalAddressY) {
      toast.error('주소 검색을 통해 위치 정보를 입력해주세요.');
      return;
    }

    try {
      await realEstateService.register({
        ...formData,
        address_x: Number(finalAddressX),
        address_y: Number(finalAddressY),
        deposit: formData.deposit ? Number(formData.deposit) : undefined,
        monthly_rent: formData.monthly_rent
          ? Number(formData.monthly_rent)
          : undefined,
        maintenance_fee: formData.maintenance_fee
          ? Number(formData.maintenance_fee)
          : undefined,
        premium: formData.premium ? Number(formData.premium) : undefined,
        price_per_pyeong: formData.price_per_pyeong
          ? Number(formData.price_per_pyeong)
          : undefined,
        area: formData.area ? Number(formData.area) : undefined,
      });

      toast.success('부동산 매물이 성공적으로 등록되었습니다.');
      router.push('/');
    } catch (error: any) {
      if (error.message === 'LOGOUT_REQUIRED') {
        toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
        router.push('/login');
        return;
      }
      toast.error(error.message || '등록 중 오류가 발생했습니다.');
    }
  };

  // 카카오맵 SDK 로드 완료 핸들러
  const handleKakaoLoad = () => {
    window.kakao.maps.load(() => {
      setKakaoLoaded(true);
    });
  };

  // 좌표 검색 함수 (Promise 반환)
  const getCoords = (
    address: string,
  ): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        reject(new Error('지도 서비스가 로드되지 않았습니다.'));
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, function (result: any, status: any) {
        if (status === window.kakao.maps.services.Status.OK) {
          const lat = Number(result[0].y);
          const lng = Number(result[0].x);
          resolve({ lat, lng });
        } else {
          reject(new Error('주소를 좌표로 변환할 수 없습니다.'));
        }
      });
    });
  };

  // 다음 우편번호 팝업 열기
  const openPostcodePopup = () => {
    new window.daum.Postcode({
      oncomplete: function (data: any) {
        // 도로명 주소와 지번 주소 설정
        const roadAddress = data.roadAddress;
        const jibunAddress = data.jibunAddress || data.autoJibunAddress;

        setFormData((prev) => ({
          ...prev,
          address_road_name: roadAddress,
          address_name: jibunAddress,
          // 주소가 바뀌면 좌표 초기화
          address_x: '',
          address_y: '',
        }));

        // 바로 좌표 변환 시도
        getCoords(roadAddress)
          .then(({ lat, lng }) => {
            setFormData((prev) => ({
              ...prev,
              address_x: String(lat),
              address_y: String(lng),
            }));
          })
          .catch(() => {
            // 실패해도 폼에는 주소가 입력됨. 제출 시 재시도.
            if (!kakaoLoaded) {
              toast('지도 기능을 불러오는 중입니다. 잠시 후 등록해주세요.', {
                icon: '⏳',
              });
            }
          });
      },
    }).open();
  };

  return (
    <>
      {/* Daum 우편번호 스크립트 */}
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`}
        strategy="lazyOnload"
        onLoad={handleKakaoLoad}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>돌아가기</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto py-10 px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Title */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  부동산 등록
                </h1>
                <p className="text-gray-500 text-sm">
                  임대 가능한 상가 정보를 등록하세요
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 주소 정보 섹션 */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  주소 정보
                </h2>
                <div className="grid gap-4">
                  {/* 주소 검색 버튼 */}
                  <button
                    type="button"
                    onClick={openPostcodePopup}
                    className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-4 text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Search className="h-5 w-5" />
                    주소 검색하기
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      지번 주소 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address_name"
                      value={formData.address_name}
                      placeholder="주소 검색을 통해 입력됩니다"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      readOnly
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      도로명 주소 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address_road_name"
                      value={formData.address_road_name}
                      placeholder="주소 검색을 통해 입력됩니다"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      readOnly
                      required
                    />
                  </div>
                </div>
              </section>

              {/* 가격 정보 섹션 */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Wallet className="h-5 w-5 text-gray-400" />
                  가격 정보
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      보증금 (만원) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleChange}
                      placeholder="5000"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      월세 (만원) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="monthly_rent"
                      value={formData.monthly_rent}
                      onChange={handleChange}
                      placeholder="200"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      관리비 (만원) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="maintenance_fee"
                      value={formData.maintenance_fee}
                      onChange={handleChange}
                      placeholder="30"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      권리금 (만원) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="premium"
                      value={formData.premium}
                      onChange={handleChange}
                      placeholder="3000"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      평당 가격 (만원)
                    </label>
                    <input
                      type="number"
                      name="price_per_pyeong"
                      value={formData.price_per_pyeong}
                      onChange={handleChange}
                      placeholder="5000"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      면적 (평) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="20"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      층수 정보 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="floor_info"
                      value={formData.floor_info}
                      onChange={handleChange}
                      placeholder="1층 / 지하1층"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* 연락처 섹션 */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Phone className="h-5 w-5 text-gray-400" />
                  연락처
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="010-1234-5678"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </section>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
