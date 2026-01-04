'use client';
import Link from 'next/link';
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaHandshake,
  FaChartLine,
} from 'react-icons/fa';

export default function PropertyOwnerSection() {
  return (
    <section className="py-24 px-4 bg-linear-to-b from-white to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 font-semibold rounded-full text-sm mb-4">
            건물주를 위한 서비스
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            공실, 빠르게 채우세요
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Star-ter에 공실을 등록하면 상권 분석 중인 예비 창업자들에게 직접
            노출됩니다.
            <br />
            중개수수료 없이, 딱 맞는 임차인을 만나보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              icon: <FaBuilding />,
              title: '간편한 등록',
              desc: '주소, 면적, 임대료 등 입력만 하면 등록 완료',
            },
            {
              icon: <FaMapMarkerAlt />,
              title: '지도 노출',
              desc: '지도에서 "입점 가능 상가"로 눈에 띄게 표시',
            },
            {
              icon: <FaHandshake />,
              title: '직거래 연결',
              desc: '내 공실에 관심있는 창업자와 직접 소통',
            },
            {
              icon: <FaChartLine />,
              title: '상권 데이터 제공',
              desc: '내 건물 주변 유동인구, 매출 데이터를 무료로 확인',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="text-3xl text-purple-600 mb-4">{item.icon}</div>
              <h5 className="text-lg font-bold text-gray-900 mb-2">
                {item.title}
              </h5>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href={'/estate-regi'}>
            <button className="cursor-pointer px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              공실 등록하러 가기 +
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
