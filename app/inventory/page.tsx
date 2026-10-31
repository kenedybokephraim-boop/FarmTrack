"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useFarmData } from "@/hooks/useFarmData"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { CURRENCY_SYMBOL, EXPENSE_CATEGORIES } from "@/hooks/lib/constants"

export default function InventoryPage() {
  const router = useRouter()
  const { user, loading: authLoading, getStoredFarmerId } = useAuth()
  const farmerId = user?.id || getStoredFarmerId()
  
  const { inventory, loading, addInventoryItem, updateInventory, removeInventoryItem, refresh } = useFarmData(farmerId)
  
  const [showForm, setShowForm] = useState(false)
  const [newItem, setNewItem] = useState({
    item_name: "",
    quantity: "",
    unit: "",
    reorder_level: ""
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  const handleAddItem = async () => {
    if (!newItem.item_name) return
    
    const result = await addInventoryItem({
      item_name: newItem.item_name,
      quantity: parseFloat(newItem.quantity) || 0,
      unit: newItem.unit || "bags",
      reorder_level: parseFloat(newItem.reorder_level) || 10
    })
    
    if (result.success) {
      setNewItem({ item_name: "", quantity: "", unit: "", reorder_level: "" })
      setShowForm(false)
    }
  }

  const isLowStock = (item: any) => {
    return item.reorder_level && item.quantity <= item.reorder_level
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
          <p className="text-gray-500 text-xs font-medium uppercase">Inventory</p>
        </div>
        <Button onClick={() => router.push("/dashboard")} variant="outline" size="sm">
          ← Back
        </Button>
      </div>

      {/* Low Stock Alert */}
      {inventory.some(isLowStock) && (
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-2xl mb-6">
          <h3 className="text-red-400 font-bold text-sm mb-2">⚠️ Low Stock Items</h3>
          <div className="space-y-1">
            {inventory.filter(isLowStock).map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-300">{item.item_name}</span>
                <span className="text-red-400">{item.quantity} {item.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Item Button */}
      <Button onClick={() => setShowForm(!showForm)} className="w-full mb-6">
        {showForm ? "Cancel" : "+ Add Inventory Item"}
      </Button>

      {/* Item Form */}
      {showForm && (
        <div className="bg-gray-900/20 p-4 rounded-2xl border border-gray-800 mb-6 space-y-4">
          <Input
            label="Item Name"
            placeholder="e.g. Feed, Vaccine, Vitamins"
            value={newItem.item_name}
            onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Quantity"
              placeholder="0"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            />
            <Input
              label="Unit"
              placeholder="bags"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            />
          </div>
          <Input
            type="number"
            label="Reorder Level"
            placeholder="10"
            value={newItem.reorder_level}
            onChange={(e) => setNewItem({ ...newItem, reorder_level: e.target.value })}
          />
          <Button onClick={handleAddItem} className="w-full">
            Save Item
          </Button>
        </div>
      )}

      {/* Inventory List */}
      <div className="space-y-3">
        {inventory.length > 0 ? (
          inventory.map((item) => (
            <div 
              key={item.id} 
              className={`bg-gray-900/20 p-4 rounded-2xl border ${
                isLowStock(item) ? 'border-red-800' : 'border-gray-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{item.item_name}</h3>
                  <p className="text-gray-500 text-xs">Reorder at: {item.reorder_level} {item.unit}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${isLowStock(item) ? 'text-red-400' : ''}`}>
                    {item.quantity}
                  </p>
                  <p className="text-gray-500 text-xs">{item.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button 
                  onClick={() => updateInventory(item.id, Math.max(0, item.quantity - 1))}
                  className="flex-1 py-2 bg-gray-800 rounded font-bold"
                >
                  -
                </button>
                <button 
                  onClick={() => updateInventory(item.id, item.quantity + 1)}
                  className="flex-1 py-2 bg-gray-800 rounded font-bold"
                >
                  +
                </button>
                <button 
                  onClick={() => removeInventoryItem(item.id)}
                  className="px-4 py-2 bg-red-900/30 text-red-400 rounded font-bold text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">📦</div>
            <p>No inventory items</p>
          </div>
        )}
      </div>
    </div>
  )
}