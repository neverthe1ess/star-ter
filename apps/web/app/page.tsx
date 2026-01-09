import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { DataTable } from "@/components/DataTable";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <DataTable />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
