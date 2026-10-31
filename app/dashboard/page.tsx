"use client";
import dynamic from "next/dynamic";

const DashboardClient = dynamic(
  () => import("./DashboardClient"),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">🌾</div>
          <p className="text-gray-400">Initializing Farm Vault...</p>
        </div>
      </div>
    )
  }
);

export default function DashboardPage() {
  return <DashboardClient />;
}