import Link from 'next/link';

export default function CtaSection() {
  return (
    <section className="py-24 text-center bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          지금 바로 시작하세요
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={'/map'}>
            <button className="w-full sm:w-auto cursor-pointer px-10 py-5 bg-gray-900 text-white text-xl font-bold rounded-full hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl">
              상권 분석하러 가기 →
            </button>
          </Link>
          <Link href={'/gongsil'}>
            <button className="w-full sm:w-auto cursor-pointer px-10 py-5 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-100 text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all">
              공실 등록하러 가기 +
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
