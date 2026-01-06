'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMapStore } from '../../stores/useMapStore';

export default function HeroSection() {
  const router = useRouter();
  const { selectArea } = useMapStore();

  const handleYeoksamClick = () => {
    // 역삼1동 선택 상태로 설정 후 분석 페이지로 이동
    selectArea({
      name: '역삼1동',
      coords: { lat: 37.4995, lng: 127.0365 },
      type: 'dong',
      code: '11680640',
    });
    router.push('/analysis');
  };

  return (
    <section className="relative flex flex-col items-center justify-center py-32 px-4 text-center bg-linear-to-b from-blue-50 to-white">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl moving-blob"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl moving-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <h5 className="text-blue-600 font-bold tracking-wider uppercase text-sm animate-fade-in-up">
          데이터 기반 의사결정 도우미
        </h5>
        <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight animate-fade-in-up animation-delay-100">
          명당을 찾아주는 <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
            상권분석 서비스 Star-ter
          </span>
        </h2>
        <div className="text-xl text-blue-600 max-w-2xl mx-auto space-y-2 animate-fade-in-up animation-delay-200">
          <p>빅데이터와 AI 기술로 최적의 창업 입지를 찾아드립니다.</p>
          <p>
            실시간 유동인구, 매출 데이터, 경쟁업체 정보를 한눈에 확인하세요.
          </p>
          <div className="flex flex-col items-center gap-3 pt-4">
            <p className="text-gray-500 text-sm font-medium">데모를 위해 준비된 추천 지역:</p>
            <button 
              onClick={handleYeoksamClick}
              className="px-6 py-2 bg-purple-100 text-purple-700 border-2 border-purple-200 rounded-full font-bold hover:bg-purple-200 transition-colors shadow-sm"
            >
              ✨ 역삼 1동 분석하러 바로가기
            </button>
          </div>
          <p className="text-purple-600 font-medium pt-2">
            건물주라면? 공실을 등록하고 예비 창업자를 만나보세요.
          </p>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
          <Link href={'/map'}>
            <button className="w-full sm:w-auto cursor-pointer px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              상권 분석하러 가기 →
            </button>
          </Link>
          <Link href={'/gongsil'}>
            <button className="w-full sm:w-auto cursor-pointer px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg font-bold rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
              공실 등록하러 가기 +
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
