import LandingPage from '@/components/landing/LandingPage';
import NewsSection from '@/components/NewsSection';

export default function Page() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingPage />
      {/* <div className="bg-gray-50 border-t">
        <NewsSection />
      </div> */}
    </div>
  );
}
