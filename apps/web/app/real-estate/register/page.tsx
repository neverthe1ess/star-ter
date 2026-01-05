'use client';

import { useState } from 'react';
import {
  Building2,
  MapPin,
  Wallet,
  ArrowLeft,
  Search,
  Calendar,
  Store,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { realEstateService } from '@/services/real-estate/real-estate.service';
import { BUSINESS_CATEGORIES } from '../constants';

// 카카오 맵 SDK 타입 정의
interface KakaoMapsServices {
  Geocoder: new () => {
    addressSearch: (
      address: string,
      callback: (
        result: Array<{ x: string; y: string }>,
        status: string,
      ) => void,
    ) => void;
  };
  Status: { OK: string };
}

interface KakaoMaps {
  load: (callback: () => void) => void;
  services: KakaoMapsServices;
}

interface Kakao {
  maps: KakaoMaps;
}

// 다음 주소 검색 SDK 타입 정의
interface DaumPostcodeData {
  roadAddress: string;
  jibunAddress: string;
  autoJibunAddress: string;
}

interface DaumPostcode {
  new (options: { oncomplete: (data: DaumPostcodeData) => void }): {
    open: () => void;
  };
}

interface Daum {
  Postcode: DaumPostcode;
}

declare global {
  interface Window {
    daum: Daum;
    kakao: Kakao;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const [kakaoLoaded, setKakaoLoaded] = useState(false);
  const [formData, setFormData] = useState({
    // 기본 정보
    name: '',
    title: '',
    // 주소 정보
    address: '',
    roadaddress: '',
    centerlatitude: '',
    centerlongitude: '',
    // 가격 정보 (천원 단위)
    deposit: '',
    monthlyrent: '',
    maintenancefee: '',
    premium: '',
    // 건물 정보
    size: '',
    floor: '',
    groundfloor: '',
    // 업종 정보
    businesslargecodename: '',
    businessmiddlecodename: '',
    // 기타 정보
    nearsubwaystation: '',
    ismoveindate: 'true', // 'true' or 'false' string for radio
    moveindate: '',
    previewphotourl: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalLat = formData.centerlatitude;
    let finalLng = formData.centerlongitude;

    // 좌표가 없지만 주소는 있는 경우 재시도
    if ((!finalLat || !finalLng) && formData.roadaddress) {
      try {
        toast.loading('위치 정보를 변환 중입니다...');
        const coords = await getCoords(formData.roadaddress);
        finalLat = String(coords.lat);
        finalLng = String(coords.lng);
        toast.dismiss();
      } catch {
        toast.dismiss();
        toast.error('주소의 위치 정보를 찾을 수 없습니다. 다시 검색해주세요.');
        return;
      }
    }

    if (!finalLat || !finalLng) {
      toast.error('주소 검색을 통해 위치 정보를 입력해주세요.');
      return;
    }

    try {
      await realEstateService.register({
        name: formData.name || undefined,
        title: formData.title || undefined,
        address: formData.address || undefined,
        roadaddress: formData.roadaddress || undefined,
        centerlatitude: Number(finalLat),
        centerlongitude: Number(finalLng),
        deposit: formData.deposit ? Number(formData.deposit) : undefined,
        monthlyrent: formData.monthlyrent
          ? Number(formData.monthlyrent)
          : undefined,
        maintenancefee: formData.maintenancefee
          ? Number(formData.maintenancefee)
          : undefined,
        premium: formData.premium ? Number(formData.premium) : undefined,
        areaprice: undefined, // 백엔드에서 자동 계산
        size: formData.size ? Number(formData.size) : undefined,
        floor: formData.floor ? Number(formData.floor) : undefined,
        groundfloor: formData.groundfloor
          ? Number(formData.groundfloor)
          : undefined,
        businesslargecodename: formData.businesslargecodename || undefined,
        businessmiddlecodename: formData.businessmiddlecodename || undefined,
        nearsubwaystation: formData.nearsubwaystation || undefined,
        ismoveindate: formData.ismoveindate === 'true',
        moveindate:
          formData.ismoveindate === 'false' && formData.moveindate
            ? formData.moveindate
            : undefined,
        previewphotourl: formData.previewphotourl || undefined,
      });

      toast.success('부동산 매물이 성공적으로 등록되었습니다.');
      router.push('/');
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message === 'LOGOUT_REQUIRED') {
        toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
        router.push('/login');
        return;
      }
      toast.error(err.message || '등록 중 오류가 발생했습니다.');
    }
  };

  const handleKakaoLoad = () => {
    window.kakao.maps.load(() => {
      setKakaoLoaded(true);
    });
  };

  const getCoords = (
    address: string,
  ): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        reject(new Error('지도 서비스가 로드되지 않았습니다.'));
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, function (result, status) {
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

  const openPostcodePopup = () => {
    new window.daum.Postcode({
      oncomplete: function (data: DaumPostcodeData) {
        const roadAddress = data.roadAddress;
        const jibunAddress = data.jibunAddress || data.autoJibunAddress;

        setFormData((prev) => ({
          ...prev,
          roadaddress: roadAddress,
          address: jibunAddress,
          centerlatitude: '',
          centerlongitude: '',
        }));

        getCoords(roadAddress)
          .then(({ lat, lng }) => {
            setFormData((prev) => ({
              ...prev,
              centerlatitude: String(lat),
              centerlongitude: String(lng),
            }));
          })
          .catch(() => {
            if (!kakaoLoaded) {
              toast('지도 기능을 불러오는 중입니다. 잠시 후 등록해주세요.', {
                icon: '⏳',
              });
            }
          });
      },
    }).open();
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <>
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

        <main className="max-w-3xl mx-auto py-10 px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
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
              {/* 기본 정보 */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  기본 정보
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={labelClass}>
                      건물명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="예: 강남빌딩"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      매물 제목 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="예: 강남역 도보 5분, 유동인구 많은 1층 상가"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </section>

              {/* 주소 정보 */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  주소 정보
                </h2>
                <div className="grid gap-4">
                  <button
                    type="button"
                    onClick={openPostcodePopup}
                    className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-4 text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Search className="h-5 w-5" />
                    주소 검색하기
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>지번 주소</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        placeholder="주소 검색을 통해 입력됩니다"
                        className={`${inputClass} bg-gray-50`}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className={labelClass}>도로명 주소</label>
                      <input
                        type="text"
                        name="roadaddress"
                        value={formData.roadaddress}
                        placeholder="주소 검색을 통해 입력됩니다"
                        className={`${inputClass} bg-gray-50`}
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>인근 지하철역</label>
                    <input
                      type="text"
                      name="nearsubwaystation"
                      value={formData.nearsubwaystation}
                      onChange={handleChange}
                      placeholder="예: 강남역"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* 가격 정보 */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-1">
                  <Wallet className="h-5 w-5 text-gray-400" />
                  가격 정보
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  해당 없는 항목은 0을 입력해 주세요
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      보증금 (천원) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleChange}
                      placeholder="5000"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      월세 (천원) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="monthlyrent"
                      value={formData.monthlyrent}
                      onChange={handleChange}
                      placeholder="200"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>관리비 (천원)</label>
                    <input
                      type="number"
                      name="maintenancefee"
                      value={formData.maintenancefee}
                      onChange={handleChange}
                      placeholder="30"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>권리금 (천원)</label>
                    <input
                      type="number"
                      name="premium"
                      value={formData.premium}
                      onChange={handleChange}
                      placeholder="3000"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* 건물 정보 */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Home className="h-5 w-5 text-gray-400" />
                  건물 정보
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>
                      면적 (m²) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      placeholder="20"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      층수 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      placeholder="1"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>건물 전체 층수</label>
                    <input
                      type="number"
                      name="groundfloor"
                      value={formData.groundfloor}
                      onChange={handleChange}
                      placeholder="5"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* 업종 정보 */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Store className="h-5 w-5 text-gray-400" />
                  업종 정보
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      업종 대분류 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="businesslargecodename"
                      value={formData.businesslargecodename}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          businesslargecodename: e.target.value,
                          businessmiddlecodename: '', // 대분류 변경 시 중분류 초기화
                        }));
                      }}
                      className={inputClass}
                    >
                      <option value="">선택하세요</option>
                      {Object.keys(BUSINESS_CATEGORIES).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      업종 중분류 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="businessmiddlecodename"
                      value={formData.businessmiddlecodename}
                      onChange={handleChange}
                      className={inputClass}
                      disabled={!formData.businesslargecodename}
                    >
                      <option value="">
                        {formData.businesslargecodename
                          ? '선택하세요'
                          : '대분류를 먼저 선택하세요'}
                      </option>
                      {formData.businesslargecodename &&
                        BUSINESS_CATEGORIES[
                          formData.businesslargecodename as keyof typeof BUSINESS_CATEGORIES
                        ]?.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* 입주 정보 */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  입주 정보
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>
                      즉시 입주 가능 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="ismoveindate"
                          value="true"
                          checked={formData.ismoveindate === 'true'}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">예</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="ismoveindate"
                          value="false"
                          checked={formData.ismoveindate === 'false'}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">아니오</span>
                      </label>
                    </div>
                  </div>
                  {formData.ismoveindate === 'false' && (
                    <div>
                      <label className={labelClass}>
                        입주 가능 날짜 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="moveindate"
                        value={formData.moveindate}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* 사진 URL */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  사진
                </h2>
                <div>
                  <label className={labelClass}>대표 이미지 URL</label>
                  <input
                    type="url"
                    name="previewphotourl"
                    value={formData.previewphotourl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className={inputClass}
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
