"use client";

import { useState } from "react";
import Link from "next/link";
import { DemoToggleButton } from "@/components/ui/DemoToggleButton";

export default function Home() {
  const [animalCount] = useState(0);

  if (animalCount === 0) {
    return (
      <main className="relative flex flex-col items-center justify-center min-h-screen text-center p-6 overflow-hidden">
        {/* BACKGROUND IMAGE WITH OVERLAY */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=2070&auto=format&fit=crop')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>

        {/* DECORATIVE ELEMENTS */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-500/20 rounded-full blur-xl" />
        <div className="absolute bottom-32 right-8 w-32 h-32 bg-green-400/20 rounded-full blur-2xl" />

        {/* CONTENT */}
        <div className="relative z-10 w-full max-w-lg px-6">
          <div className="text-7xl mb-6 animate-bounce">
            🇳🇬
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg leading-tight">
            Poultry Farm <br/>
            <span className="text-green-400">Manager</span>
          </h1>
          
          <p className="text-gray-200 text-xl mb-12 font-medium leading-relaxed">
            No more paper books. <br/> 
            Track your <span className="text-green-300 font-bold">🐔 Layers</span> and <span className="text-green-300 font-bold">🐣 Broilers</span> on your phone.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 mt-8 justify-center">
            <Link href="/register">
              <button className="w-full md:w-auto bg-gradient-to-r from-green-500 to-green-600 text-white py-5 px-8 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-green-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                + Register My Farm
              </button>
            </Link>
            
            <DemoToggleButton />
          </div>

          <p className="mt-16 text-sm text-gray-400 uppercase tracking-widest font-semibold">
            Built for Nigerian Farmers 🇳🇬
          </p>
        </div>
      </main>
    );
  }

  return null;
}