"use client"

import { useState, useEffect } from 'react'
import type { AIAlert } from '@/types'

interface AIAlertsProps {
  farmerId: string | null
  fetchAlerts: () => Promise<AIAlert[]>
  onMarkRead: (alertId: string) => Promise<void>
  onMarkAllRead: () => Promise<void>
}

export function AIAlerts({ farmerId, fetchAlerts, onMarkRead, onMarkAllRead }: AIAlertsProps) {
  const [alerts, setAlerts] = useState<AIAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    // For demo mode, skip the Supabase fetch - fetchAlerts already returns mock data
    let cancelled = false

    const load = async () => {
      try {
        const data = await fetchAlerts()
        if (!cancelled) {
          setAlerts(data)
        }
      } catch (err) {
        console.error('Failed to load alerts:', err)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [farmerId, fetchAlerts])

  const handleMarkRead = async (alertId: string) => {
    await onMarkRead(alertId)
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a))
  }

  const unreadCount = alerts.filter(a => !a.is_read).length
  const displayedAlerts = showAll ? alerts : alerts.filter(a => !a.is_read).slice(0, 3)

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/50 bg-red-500/10'
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-500/10'
      default:
        return 'border-blue-500/30 bg-blue-500/10'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-900/20 p-5 rounded-3xl border border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="animate-pulse h-2 w-2 bg-yellow-500 rounded-full"></span>
          <span className="text-[10px] font-bold text-yellow-500 uppercase">Loading AI Alerts...</span>
        </div>
      </div>
    )
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-900/20 p-5 rounded-3xl border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="animate-pulse h-2 w-2 bg-yellow-500 rounded-full"></span>
          <span className="text-[10px] font-bold text-yellow-500 uppercase">AI Alerts</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={onMarkAllRead}
            className="text-[10px] text-gray-400 hover:text-white"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayedAlerts.map((alert) => (
          <div 
            key={alert.id}
            className={`p-4 rounded-2xl border ${getSeverityStyles(alert.severity)} cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={() => !alert.is_read && handleMarkRead(alert.id)}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{alert.title}</p>
                <p className="text-xs text-gray-400 mt-1">{alert.message}</p>
                <p className="text-[10px] text-gray-500 mt-2">
                  {new Date(alert.created_at).toLocaleDateString('en-NG', { 
                    day: 'numeric', 
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {!alert.is_read && (
                <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
          </div>
        ))}
      </div>

      {alerts.length > 3 && (
        <button 
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-gray-500 hover:text-white mt-3 w-full text-center"
        >
          {showAll ? 'Show less' : `Show all ${alerts.length} alerts`}
        </button>
      )}
    </div>
  )
}