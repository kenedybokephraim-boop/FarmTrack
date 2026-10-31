export async function processPendingSync(): Promise<{ success: number; failed: number }> {
  return { success: 0, failed: 0 }
}

export async function hasPendingSyncItems(): Promise<boolean> {
  return false
}

export async function getPendingSyncCount(): Promise<number> {
  return 0
}
