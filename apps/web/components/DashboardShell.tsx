"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Sidebar } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeMenu = useMemo(() => {
    if (!pathname) return "home";
    if (pathname.includes("/locations/search")) return "templates";
    if (pathname.includes("/locations/detail")) return "meetings";
    return "home";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#f7f7f8] flex relative">
      <Sidebar
        activeMenu={activeMenu}
        onMenuClick={(id) => {
          if (id === "home") router.push("/locations");
          if (id === "templates") router.push("/locations/search");
          if (id === "meetings") router.push("/locations/detail");
        }}
        isOpen={isSidebarOpen}
        onToggle={setIsSidebarOpen}
      />
      <div
        className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-[350px]" : "ml-20"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
