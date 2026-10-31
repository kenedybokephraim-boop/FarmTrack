import { useState, useEffect, useCallback } from 'react'

interface NetworkStatus {
  isOnline: boolean
  wasOffline: boolean
  connectionType: string | null
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    connectionType: null
  })

  const handleOnline = useCallback(() => {
    setStatus(prev => ({
      isOnline: true,
      wasOffline: prev.wasOffline || !prev.isOnline,
      connectionType: getConnectionType()
    }))
  }, [])

  const handleOffline = useCallback(() => {
    setStatus(prev => ({
      isOnline: false,
      wasOffline: true,
      connectionType: getConnectionType()
    }))
  }, [])

  const getConnectionType = (): string | null => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return null
    }
    const connection = (navigator as any).connection
    return connection?.effectiveType || connection?.type || null
  }

  useEffect(() => {
    setStatus(prev => ({
      ...prev,
      connectionType: getConnectionType()
    }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', () => {
        setStatus(prev => ({
          ...prev,
          connectionType: getConnectionType()
        }))
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if (connection) {
        connection.removeEventListener('change', () => {})
      }
    }
  }, [handleOnline, handleOffline])

  return status
}

export function useSyncOnConnect() {
  const { isOnline, wasOffline } = useNetworkStatus()
  const [syncTrigger, setSyncTrigger] = useState(0)

  useEffect(() => {
    if (isOnline && wasOffline) {
      setSyncTrigger(prev => prev + 1)
    }
  }, [isOnline, wasOffline])

  return { shouldSync: isOnline && wasOffline, syncTrigger }
}