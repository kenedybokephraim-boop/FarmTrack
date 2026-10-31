import { useState, useCallback } from 'react'
import { getAlerts, createAlert, markAlertAsRead, markAllAlertsAsRead, getUnreadAlertCount } from '@/hooks/lib/api/alerts'
import { getDailyRecords } from '@/hooks/lib/api/daily-records'
import { getHealthLogs } from '@/hooks/lib/api/health-logs'
import type { AIAlertInput, DailyRecord, WeeklyDataPoint, AIAlert } from '@/types'



interface AIResponse {
  success: boolean
  response?: string
  error?: string
}

function formatRecordsForAI(records: DailyRecord[]): string {
  if (records.length === 0) return 'No historical data available yet.'
  
  return records.slice(0, 10).map(record => 
    `Date: ${record.record_date}, Feed: ${record.feed_bags_used} bags (₦${record.feed_cost}), Loss: ${record.mortality_count}, Eggs: ${record.production_amt}, Sales: ₦${(record.egg_sales_amount || 0) + (record.bird_sales_amount || 0) + (record.manure_sales_amount || 0)}`
  ).join('\n')
}

function analyzeTrends(records: DailyRecord[], farmerId: string): AIAlertInput[] {
  const alerts: AIAlertInput[] = []
  
  if (records.length < 3) return alerts
  
  const recent = records.slice(0, 3)
  const previous = records.slice(3, 6)
  
  if (previous.length === 0) return alerts
  
  const avgMortalityRecent = recent.reduce((sum, r) => sum + r.mortality_count, 0) / recent.length
  const avgMortalityPrevious = previous.reduce((sum, r) => sum + r.mortality_count, 0) / previous.length
  
  if (avgMortalityRecent > avgMortalityPrevious * 2 && avgMortalityRecent > 2) {
    alerts.push({
      farmer_id: farmerId,
      alert_type: 'mortality',
      title: '⚠️ Mortality Spike Detected',
      message: `Mortality has increased from average ${avgMortalityPrevious.toFixed(1)} to ${avgMortalityRecent.toFixed(1)} birds. Consider checking for disease or environmental issues.`,
      severity: 'critical'
    })
  }
  
  const avgProductionRecent = recent.reduce((sum, r) => sum + r.production_amt, 0) / recent.length
  const avgProductionPrevious = previous.reduce((sum, r) => sum + r.production_amt, 0) / previous.length
  
  if (avgProductionPrevious > 0 && avgProductionRecent < avgProductionPrevious * 0.8) {
    alerts.push({
      farmer_id: farmerId,
      alert_type: 'production',
      title: '📉 Production Drop Alert',
      message: `Egg production has dropped by ${((1 - avgProductionRecent/avgProductionPrevious) * 100).toFixed(0)}%. Check feed quality and lighting conditions.`,
      severity: 'warning'
    })
  }
  
  const avgFeedCostRecent = recent.reduce((sum, r) => sum + r.feed_cost, 0) / recent.length
  if (avgFeedCostRecent > 50000) {
    alerts.push({
      farmer_id: farmerId,
      alert_type: 'feed_cost',
      title: '💰 High Feed Costs',
      message: `Average daily feed cost is ₦${avgFeedCostRecent.toFixed(0)}. Consider bulk purchasing or exploring alternative suppliers.`,
      severity: 'info'
    })
  }
  
  const lastRecordDate = new Date(records[0].record_date)
  const daysSinceLastRecord = Math.floor((Date.now() - lastRecordDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysSinceLastRecord >= 3) {
    alerts.push({
      farmer_id: farmerId,
      alert_type: 'general',
      title: '📝 Missing Daily Records',
      message: `You haven't logged any records for ${daysSinceLastRecord} days. Regular logging helps AI provide better insights.`,
      severity: 'info'
    })
  }
  
  return alerts
}

function formatWeeklyData(weeklyData: WeeklyDataPoint[]): string {
  if (weeklyData.length === 0) return 'No weekly data available.'
  
  return weeklyData.map(d => 
    `${d.dayName} (${d.date}): ${d.eggs} eggs, ${d.feed}kg feed`
  ).join('\n')
}

export function useAI(farmerId: string | null) {
   const [loading, setLoading] = useState(false)
   const [alertCount, setAlertCount] = useState(0)
    
  // Check for demo mode
  const isDemo = typeof window !== 'undefined' && document.cookie.includes('demo_mode=true')

    const getAIAdvice = useCallback(async (question: string, records: DailyRecord[], weeklyData: WeeklyDataPoint[]): Promise<AIResponse> => {
      if (!process.env.NEXT_PUBLIC_HF_TOKEN) {
        return { success: false, error: 'Hugging Face API token not configured' }
      }

     setLoading(true)

     try {
       const historyString = formatRecordsForAI(records)
       const weeklyString = formatWeeklyData(weeklyData)

       const prompt = `
         You are an expert Poultry Consultant. Analyze the following 7-day production data:
         ${weeklyString}

         Look for trends in egg production, feed consumption, and mortality. If production is dropping or mortality is rising, provide a concise, 2-sentence diagnosis for a farmer in Nigeria.

         FARM DATA HISTORY:
         ${historyString}

         FARMER'S QUESTION: "${question}"

         INSTRUCTIONS:
          - Keep answer under 100 words.
          - Use professional, expert yet encouraging tone.
          - If data is empty, provide general poultry startup advice.
          -If the user has fewer than 7 days of data, acknowledge that they are just starting out and only analyze the available days instead of assuming the missing days are zeros.
         
         - NIGERIAN MARKET CONTEXT (2026):
           * 50kg Feed: ₦18,000 - ₦24,000
           * Crate of Eggs: ₦4,000 - ₦5,000
           * Point of Lay: ₦5,500 - ₦7,500
           * Use these prices for any financial estimates.
       `

       const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HF_TOKEN}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           model: 'meta-llama/Llama-3.1-8B-Instruct:novita',
           messages: [{ role: 'user', content: prompt }],
           max_tokens: 500,
         }),
       })

       if (!response.ok) {
         const errorData = await response.json().catch(() => ({}))
         throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`)
       }

       const data = await response.json()
       const aiResponse = data.choices?.[0]?.message?.content

       if (!aiResponse) {
         throw new Error('Invalid response format from AI provider')
       }

         setLoading(false)
         return { success: true, response: aiResponse }
       } catch (err: unknown) {
         setLoading(false)
         const message = err instanceof Error ? err.message : 'AI request failed'
         return { success: false, error: message }
       }
     }, [isDemo])

   const generateProactiveAlerts = useCallback(async (): Promise<AIAlertInput[]> => {
     // In demo mode, don't write to Supabase - just return mock alerts
     if (isDemo || !farmerId) {
       const demoAlerts: AIAlertInput[] = [
         {
           farmer_id: 'demo',
           alert_type: 'mortality',
           title: '⚠️ Mortality Spike Detected',
           message: 'Mortality has increased from average 2.1 to 4.3 birds. Consider checking for disease or environmental issues.',
           severity: 'critical'
         },
         {
           farmer_id: 'demo',
           alert_type: 'production',
           title: '📉 Production Drop Alert',
           message: 'Egg production has dropped by 15%. Check feed quality and lighting conditions.',
           severity: 'warning'
         },
         {
           farmer_id: 'demo',
           alert_type: 'feed_cost',
           title: '💰 High Feed Costs',
           message: 'Average daily feed cost is ₦52,000. Consider bulk purchasing or exploring alternative suppliers.',
           severity: 'info'
         }
       ]
       return demoAlerts
     }

     try {
       const [records, healthLogs] = await Promise.all([
         getDailyRecords(farmerId, 10),
         getHealthLogs(farmerId, 5)
       ])
       
       const trendAlerts = analyzeTrends(records, farmerId)
       
       for (const alert of trendAlerts) {
         await createAlert({ ...alert, farmer_id: farmerId })
       }
       
       if (healthLogs.some(log => log.action.toLowerCase().includes('disease') || log.action.toLowerCase().includes('sick'))) {
         const diseaseAlert: AIAlertInput = {
           farmer_id: farmerId,
           alert_type: 'health',
           title: '🏥 Health Issue Logged',
           message: 'A health issue was recorded. Consider scheduling a vet visit and monitor affected birds closely.',
           severity: 'warning'
         }
         await createAlert(diseaseAlert)
       }
       
       return trendAlerts
     } catch (err) {
       console.error('Failed to generate alerts:', err)
       return []
     }
   }, [isDemo, farmerId])

   const fetchAlerts = useCallback(async (): Promise<AIAlert[]> => {
     // In demo mode, return mock alerts instead of fetching from Supabase
     if (isDemo || !farmerId) {
       const demoAlerts: AIAlert[] = [
         {
           id: 'demo-1',
           farmer_id: 'demo',
           alert_type: 'mortality',
           title: '⚠️ Mortality Spike Detected',
           message: 'Mortality has increased from average 2.1 to 4.3 birds. Consider checking for disease or environmental issues.',
           severity: 'critical',
           is_read: false,
           created_at: new Date(Date.now() - 86400000).toISOString()
         },
         {
           id: 'demo-2',
           farmer_id: 'demo',
           alert_type: 'production',
           title: '📉 Production Drop Alert',
           message: 'Egg production has dropped by 15%. Check feed quality and lighting conditions.',
           severity: 'warning',
           is_read: false,
           created_at: new Date(Date.now() - 43200000).toISOString()
         },
         {
           id: 'demo-3',
           farmer_id: 'demo',
           alert_type: 'feed_cost',
           title: '💰 High Feed Costs',
           message: 'Average daily feed cost is ₦52,000. Consider bulk purchasing or exploring alternative suppliers.',
           severity: 'info',
           is_read: true,
           created_at: new Date(Date.now() - 172800000).toISOString()
         }
       ]
       return demoAlerts
     }
     return await getAlerts(farmerId)
   }, [isDemo, farmerId])

   const fetchUnreadCount = useCallback(async (): Promise<number> => {
     // In demo mode, return mock count
     if (isDemo || !farmerId) {
       return 2
     }
     return await getUnreadAlertCount(farmerId)
   }, [isDemo, farmerId])

const markAsRead = useCallback(async (alertId: string) => {
      if (!isDemo && farmerId) {
        await markAlertAsRead(alertId, farmerId)
      }
      const count = await fetchUnreadCount()
      setAlertCount(count)
    }, [isDemo, farmerId, fetchUnreadCount])

   const markAllRead = useCallback(async () => {
     if (!isDemo && farmerId) {
       await markAllAlertsAsRead(farmerId)
     }
     setAlertCount(0)
   }, [isDemo, farmerId])

   const checkAndGenerateAlerts = useCallback(async () => {
     if (!farmerId) return
     const currentCount = await fetchUnreadCount()
     setAlertCount(currentCount)
     
     if (currentCount === 0 && !isDemo) {
       await generateProactiveAlerts()
       const newCount = await fetchUnreadCount()
      setAlertCount(newCount)
     }
   }, [farmerId, fetchUnreadCount, generateProactiveAlerts, isDemo])
  
  return {
    loading,
    alertCount,
    getAIAdvice,
    fetchAlerts,
    fetchUnreadCount,
    markAsRead,
    markAllRead,
    checkAndGenerateAlerts,
    generateProactiveAlerts
  }
}