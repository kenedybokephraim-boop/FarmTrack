"use client"

import { useNetworkStatus } from '@/hooks/useNetworkStatus'

interface OfflineStatusBarProps {
  pendingSyncCount?: number
  isSyncing?: boolean
  onSync?: () => void
}

export function OfflineStatusBar({ pendingSyncCount = 0, isSyncing = false, onSync }: OfflineStatusBarProps) {
  const { isOnline } = useNetworkStatus()

  if (isOnline && pendingSyncCount === 0) {
    return null
  }

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-amber-500/90 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-sm z-50">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4 4 0 01-5.523-5.523m7.072 7.072L15.536 8.464" />
        </svg>
        <span className="text-sm font-medium">Offline Mode</span>
        <span className="text-xs opacity-80">- Data saved locally</span>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-sm z-50">
      {isSyncing ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm font-medium">Syncing {pendingSyncCount} items...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span className="text-sm font-medium">{pendingSyncCount} items pending sync</span>
          <button 
            onClick={onSync}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full transition-colors"
          >
            Sync Now
          </button>
        </>
      )}
    </div>
  )
}

export function SyncIndicator({ pendingSyncCount, isSyncing, lastSynced }: { 
  pendingSyncCount: number
  isSyncing: boolean 
  lastSynced: Date | null
}) {
  const { isOnline, connectionType } = useNetworkStatus()

  if (isOnline && pendingSyncCount === 0 && !lastSynced) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      {!isOnline ? (
        <span className="flex items-center gap-1 text-amber-500">
          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
          Offline
        </span>
      ) : isSyncing ? (
        <span className="flex items-center gap-1 text-blue-500">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          Syncing...
        </span>
      ) : pendingSyncCount > 0 ? (
        <span className="flex items-center gap-1 text-orange-500">
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          {pendingSyncCount} pending
        </span>
      ) : (
        <span className="flex items-center gap-1 text-green-500">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Online
        </span>
      )}
      {connectionType && isOnline && (
        <span className="text-gray-600 capitalize">{connectionType}</span>
      )}
    </div>
  )
}