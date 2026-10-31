"use client"

import { useState } from 'react'
import { Button } from '../ui/Button'
import type { DailyRecord } from '@/types'

interface AIConsultantProps {
  onAsk: (question: string, records: DailyRecord[]) => Promise<{ success: boolean; response?: string; error?: string }>
  loading?: boolean
}

export function AIConsultant({ onAsk, loading = false }: AIConsultantProps) {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')

  const handleAsk = async () => {
    if (!question.trim()) return
    
    setError('')
    const result = await onAsk(question, [])
    
    if (result.success && result.response) {
      setResponse(result.response)
    } else {
      setError(result.error || 'Failed to get response')
    }
  }

  return (
    <div className="bg-blue-900/10 p-6 rounded-3xl border border-blue-500/20">
      <h3 className="text-blue-400 font-bold text-sm uppercase mb-3 flex items-center gap-2">
        ✨ Ask the AI Expert
      </h3>
      
      <textarea 
        className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-sm mb-3 outline-none focus:border-blue-500 transition-all text-white"
        placeholder="Ex: My birds are 4 weeks old and 5 died today, what should I do?"
        rows={2}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      
      <Button 
        onClick={handleAsk}
        disabled={loading || !question.trim()}
        className="w-full"
        loading={loading}
      >
        Get AI Diagnosis
      </Button>

      {error && (
        <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-4 p-5 bg-gray-900/80 rounded-2xl border border-blue-500/30 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-[10px] text-blue-300 font-bold uppercase mb-2">AI Diagnosis:</p>
          <p className="text-sm leading-relaxed text-gray-200">{response}</p>
        </div>
      )}
    </div>
  )
}