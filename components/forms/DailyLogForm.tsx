"use client"

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { DailyRecordInput } from '@/types'

interface DailyLogFormProps {
  onSubmit: (record: Omit<DailyRecordInput, 'farmer_id'>) => Promise<{ success: boolean; error?: string }>
  loading?: boolean
}

const parseSalesAmount = (value: string) => {
  const amount = parseFloat(value)
  return Number.isFinite(amount) ? amount : 0
}

export function DailyLogForm({ onSubmit, loading = false }: DailyLogFormProps) {
  const [feedBags, setFeedBags] = useState('')
  const [feedCost, setFeedCost] = useState('')
  const [mortality, setMortality] = useState('')
  const [production, setProduction] = useState('')
  const [eggSales, setEggSales] = useState('')
  const [birdSales, setBirdSales] = useState('')
  const [manureSales, setManureSales] = useState('')
  const [showOtherSales, setShowOtherSales] = useState(false)
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const record = {
      feed_bags_used: parseFloat(feedBags) || 0,
      feed_cost: parseFloat(feedCost) || 0,
      mortality_count: parseInt(mortality, 10) || 0,
      production_amt: parseInt(production, 10) || 0,
      egg_sales_amount: parseFloat(eggSales) || 0,
      bird_sales_amount: parseFloat(birdSales) || 0,
      manure_sales_amount: parseFloat(manureSales) || 0,
      notes: notes || undefined,
      record_date: new Date().toISOString().split('T')[0]
    }

    const result = await onSubmit(record)

    if (result.success) {
      setFeedBags('')
      setFeedCost('')
      setMortality('')
      setProduction('')
      setEggSales('')
      setBirdSales('')
      setManureSales('')
      setShowOtherSales(false)
      setNotes('')
    } else {
      toast.error(result.error || 'Failed to save record')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="0.0"
          label="Feed (Bags)"
          value={feedBags}
          onChange={(e) => setFeedBags(e.target.value)}
        />
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          label="Feed Cost (₦)"
          value={feedCost}
          onChange={(e) => setFeedCost(e.target.value)}
        />
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          label="Loss (Birds)"
          value={mortality}
          onChange={(e) => setMortality(e.target.value)}
        />
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          label="Harvest (Crates)"
          value={production}
          onChange={(e) => setProduction(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          label="Egg Sales (₦)"
          value={eggSales}
          onChange={(e) => setEggSales(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowOtherSales((current) => !current)}
          className="w-full text-left text-xs font-semibold text-emerald-400 hover:text-emerald-300 active:scale-[0.99] transition-all duration-200"
        >
          {showOtherSales ? '— Hide other sales fields' : '+ Add bird or manure sales'}
        </button>

        {showOtherSales && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-slate-800/25 border border-slate-700/40 p-4">
            <Input
              type="number"
              inputMode="decimal"
              placeholder="0"
              label="Bird Sales (₦)"
              value={birdSales}
              onChange={(e) => setBirdSales(e.target.value)}
            />
            <Input
              type="number"
              inputMode="decimal"
              placeholder="0"
              label="Manure Sales (₦)"
              value={manureSales}
              onChange={(e) => setManureSales(e.target.value)}
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">
          Notes
        </label>
        <textarea
          className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800 text-white outline-none focus:border-green-500 transition-all resize-none"
          placeholder="Any observations..."
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        Save Daily Records
      </Button>
    </form>
  )
}