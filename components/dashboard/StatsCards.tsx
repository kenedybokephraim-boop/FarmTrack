"use client"

import type { FarmStats } from '@/types'

interface StatsCardsProps {
  stats: FarmStats | null
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900/40 p-5 rounded-3xl border border-gray-800 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gray-900/40 p-5 rounded-3xl border border-gray-800 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Revenue</p>
          <h2 className="text-xl font-black text-white">₦{stats.totalSales.toLocaleString()}</h2>
        </div>
        <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
          ₦
        </div>
      </div>

      <div className="bg-gray-900/40 p-5 rounded-3xl border border-gray-800 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Loss</p>
          <h2 className="text-xl font-black text-white">
            {stats.totalMortality} <span className="text-xs font-normal">Birds</span>
          </h2>
        </div>
        <div className="h-10 w-10 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
          💀
        </div>
      </div>

      <div className="bg-gray-900/40 p-5 rounded-3xl border border-gray-800 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Avg Yield</p>
          <h2 className="text-xl font-black text-white">
            {stats.avgProduction.toFixed(1)} <span className="text-xs font-normal text-gray-400">Crates</span>
          </h2>
        </div>
        <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
          🥚
        </div>
      </div>
    </div>
  )
}