"use client"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-800 rounded-lg ${className}`} />
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-gray-900/20 p-4 rounded-2xl border border-gray-800">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-8 w-24" />
    </div>
  )
}

export function RecordSkeleton() {
  return (
    <div className="bg-black/40 p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
      <div>
        <Skeleton className="h-2 w-16 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}