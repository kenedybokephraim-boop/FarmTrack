"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useFarmData } from "@/hooks/useFarmData"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { CURRENCY_SYMBOL } from "@/hooks/lib/constants"

export default function BatchesPage() {
  const router = useRouter()
  const { user, loading: authLoading, getStoredFarmerId } = useAuth()
  const farmerId = user?.id || getStoredFarmerId()
  
  const { batches, loading, addBatch, updateBatch, removeBatch, refresh } = useFarmData(farmerId)
  
  const [showForm, setShowForm] = useState(false)
  const [newBatch, setNewBatch] = useState({
    batch_name: "",
    animal_type: "Layers",
    initial_count: ""
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  const handleAddBatch = async () => {
    if (!newBatch.batch_name || !newBatch.initial_count) return
    
    const result = await addBatch({
      batch_name: newBatch.batch_name,
      animal_type: newBatch.animal_type,
      initial_count: parseInt(newBatch.initial_count),
      acquired_date: new Date().toISOString().split('T')[0]
    })
    
    if (result.success) {
      setNewBatch({ batch_name: "", animal_type: "Layers", initial_count: "" })
      setShowForm(false)
    }
  }

  const handleUpdateCount = async (id: string, newCount: number) => {
    await updateBatch(id, newCount)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-5 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pt-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-green-500">FarmTrack</h1>
          <p className="text-gray-500 text-xs font-medium uppercase">Batches</p>
        </div>
        <Button onClick={() => router.push("/dashboard")} variant="outline" size="sm">
          ← Back
        </Button>
      </div>

      {/* Add Batch Button */}
      <Button onClick={() => setShowForm(!showForm)} className="w-full mb-6">
        {showForm ? "Cancel" : "+ Add New Batch"}
      </Button>

      {/* Batch Form */}
      {showForm && (
        <div className="bg-gray-900/20 p-4 rounded-2xl border border-gray-800 mb-6 space-y-4">
          <Input
            label="Batch Name"
            placeholder="e.g. Batch 2024-01"
            value={newBatch.batch_name}
            onChange={(e) => setNewBatch({ ...newBatch, batch_name: e.target.value })}
          />
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Animal Type</label>
            <select
              className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800"
              value={newBatch.animal_type}
              onChange={(e) => setNewBatch({ ...newBatch, animal_type: e.target.value })}
            >
              <option value="Layers">Layers</option>
              <option value="Broilers">Broilers</option>
            </select>
          </div>
          <Input
            type="number"
            label="Initial Count"
            placeholder="100"
            value={newBatch.initial_count}
            onChange={(e) => setNewBatch({ ...newBatch, initial_count: e.target.value })}
          />
          <Button onClick={handleAddBatch} className="w-full">
            Save Batch
          </Button>
        </div>
      )}

      {/* Batches List */}
      <div className="space-y-3">
        {batches.length > 0 ? (
          batches.map((batch) => (
            <div key={batch.id} className="bg-gray-900/20 p-4 rounded-2xl border border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold">{batch.batch_name || batch.animal_type}</h3>
                  <p className="text-gray-500 text-xs">
                    {batch.animal_type} • Joined {new Date(batch.acquired_date).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => removeBatch(batch.id)}
                  className="text-red-500 text-xs font-bold"
                >
                  Delete
                </button>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex-1">
                  <span className="text-gray-500 text-xs">Current Count</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleUpdateCount(batch.id, batch.current_count - 1)}
                      className="w-8 h-8 bg-gray-800 rounded font-bold"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold flex-1 text-center">{batch.current_count}</span>
                    <button 
                      onClick={() => handleUpdateCount(batch.id, batch.current_count + 1)}
                      className="w-8 h-8 bg-gray-800 rounded font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 text-xs">Initial</span>
                  <p className="text-lg font-bold">{batch.initial_count}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">🐣</div>
            <p>No batches yet</p>
          </div>
        )}
      </div>
    </div>
  )
}