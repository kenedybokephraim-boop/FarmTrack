"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function DemoToggleButton() {
  const router = useRouter();
  const { loginDemo } = useAuth();

  const handleDemoLogin = async () => {
    const result = await loginDemo();
    if (result?.success === false) {
      console.error('Demo login failed:', result.error);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <button
      onClick={handleDemoLogin}
      className="w-full md:w-auto flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md text-white py-4 px-8 rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-200 group"
    >
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </div>
      Try Live Demo
    </button>
  );
}