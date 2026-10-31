"use client"
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFarmData } from "@/hooks/useFarmData";
import { getFarmerById } from "@/hooks/lib/api/farmers";
import { useRouter } from "next/navigation";
import { useAI } from "@/hooks/useAI";
import { supabase } from "@/hooks/lib/supabase";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DailyLogForm } from "@/components/forms/DailyLogForm";
import { AIAlerts } from "@/components/dashboard/AIAlerts";
import { AIConsultant } from "@/components/dashboard/AIConsultant";
import { PaystackUpgrade } from "@/components/PaystackUpgrade";
import { prepareWeeklyData } from "@/components/dashboard/WeeklyPoultryChart";
import type { DailyRecordInput } from "@/types";
import dynamic from "next/dynamic";

// Dynamic sub-components requiring browser layouts
const WeeklyPoultryChart = dynamic(
  () => import("@/components/dashboard/WeeklyPoultryChart").then((mod) => mod.WeeklyPoultryChart),
  { ssr: false }
);

export default function DashboardComponent() {
  const router = useRouter();
  const { user, loading: authLoading, logout, getStoredFarmerId } = useAuth();
  const farmerId = user?.id || getStoredFarmerId();
  const [farmerData, setFarmerData] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [farmerLoading, setFarmerLoading] = useState(false);
  const [vaccineName, setVaccineName] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);

  const { 
    records, 
    stats, 
    loading: dataLoading, 
    addRecord, 
    addHealthLog,
    refresh
  } = useFarmData(farmerId);

  const {
    getAIAdvice,
    fetchAlerts,
    markAsRead,
    markAllRead,
    checkAndGenerateAlerts: aiCheckAlerts
  } = useAI(farmerId);

  useEffect(() => {
    if (farmerId) {
      aiCheckAlerts();
    }
  }, [farmerId, aiCheckAlerts]);

  // Fetch farmer data to check premium status (With Demo UUID Safety Guard)
  useEffect(() => {
    if (!farmerId || farmerId === "demo") {
      if (farmerId === "demo") {
        setFarmerData({ is_premium: true }); // Give demo profiles automatic pro capabilities
      }
      return;
    }

    setFarmerLoading(true);
    getFarmerById(farmerId)
      .then((data) => {
        setFarmerData(data);
        setIsPremium(data?.is_premium ?? false);
      })
      .catch((err) => {
        console.error("Failed to fetch farmer data:", err);
      })
      .finally(() => {
        setFarmerLoading(false);
      });
  }, [farmerId]);

  // Realtime listener: keep premium status in sync when Paystack webhook updates the database
  useEffect(() => {
    if (!farmerId || farmerId === "demo") {
      return;
    }

    const channel = supabase
      .channel('farmer-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'farmers',
          filter: `id=eq.${farmerId}`
        },
        (payload) => {
          const newIsPremium = payload.new?.is_premium ?? false;
          setIsPremium(newIsPremium);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmerId]);

  const handleLogout = async () => {
    await logout();
    router.push("/login"); // 🚀 Safe, clean server-rendering redirect
  };

  const handleSaveRecord = async (newRecord: Omit<DailyRecordInput, 'farmer_id'>) => {
    return await addRecord(newRecord);
  };

  const handleSaveVaccine = async () => {
    if (!vaccineName.trim()) return;
    
    const result = await addHealthLog({
      action: "Vaccination",
      details: vaccineName,
      cost: 0,
      record_date: new Date().toISOString().split('T')[0]
    });
    
    if (result.success) {
      setVaccineName("");
      if (typeof window !== 'undefined') {
        alert(`${vaccineName} recorded!`);
      }
    } else {
      if (typeof window !== 'undefined') {
        alert(result.error || "Failed to save");
      }
    }
  };

  const handleAskAI = async (question: string) => {
    if (!question.trim()) return { success: false, error: 'Please enter a question' };
    
    setQuestionLoading(true);
    const weekly = prepareWeeklyData(records);
    const result = await getAIAdvice(question, records, weekly);
    setQuestionLoading(false);
    
    return result;
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">🌾</div>
          <p className="text-gray-400">Loading your farm...</p>
        </div>
      </div>
    );
  }

  if (!user && !farmerId) {
    router.push('/login');
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">🔄</div>
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-5 font-sans pb-24 text-left">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 pt-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-green-500">FarmTrack</h1>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">
            {user?.farm_type || 'Poultry'} Vault
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="h-10 w-10 bg-red-500/10 rounded-full border border-red-500/20 flex items-center justify-center text-red-500 text-xs font-bold"
        >
          Exit
        </button>
      </div>

      {/* STATS */}
      <StatsCards stats={stats} />

      {/* WEEKLY CHART */}
      <WeeklyPoultryChart records={records} />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* Welcome */}
          <div className="mb-2 px-1">
            <p className="text-gray-400 text-sm">
              Welcome back, <span className="text-white font-bold">{user?.full_name || user?.name || 'Farmer'}</span>
            </p>
          </div>

          {/* AI Alerts */}
          <AIAlerts 
            farmerId={farmerId}
            fetchAlerts={fetchAlerts}
            onMarkRead={markAsRead}
            onMarkAllRead={markAllRead}
          />

          {/* Daily Form */}
          <section className="bg-gray-900/10 p-6 rounded-3xl border border-gray-800">
            <h2 className="text-lg font-bold mb-6">Daily Performance Log</h2>
            <DailyLogForm 
              onSubmit={handleSaveRecord}
              loading={dataLoading}
            />
          </section>

          {/* AI Consultant */}
          {!farmerLoading && farmerData ? (
            farmerData.is_premium ? (
              <AIConsultant 
                onAsk={handleAskAI} 
                loading={questionLoading} 
              />
            ) : (
              <section className="bg-gray-900/10 p-6 rounded-3xl border border-dashed border-gray-800">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">AI Consultant (Pro Feature)</h2>
                <p className="text-gray-400 mb-4">
                  Unlock AI-powered farming advice with our Premium plan. Get personalized recommendations, 
                  predictive analytics, and expert insights to maximize your farm's productivity.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-xl">
                    <span className="text-xs">🎯</span>
                    <span className="text-xs">Personalized feeding schedules</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-xl">
                    <span className="text-xs">📊</span>
                    <span className="text-xs">Growth prediction models</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-xl">
                    <span className="text-xs">🔔</span>
                    <span className="text-xs">Early disease detection alerts</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-xl">
                    <span className="text-xs">💰</span>
                    <span className="text-xs">Cost optimization insights</span>
                  </div>
                </div>
                <PaystackUpgrade 
                  email={user?.email || ""} 
                  userId={user?.id || ""} 
                />
              </section>
            )
          ) : (
            <section className="bg-gray-900/10 p-6 rounded-3xl border border-dashed border-gray-800">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">AI Consultant</h2>
              <p className="text-gray-400">Loading farmer profile...</p>
            </section>
          )}

          {/* Health Logs */}
          <section className="bg-gray-900/10 p-6 rounded-3xl border border-dashed border-gray-800">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Health Logs</h2>
            <input 
              type="text" 
              placeholder="Record Vaccine (e.g. Gumboro)"
              className="w-full bg-transparent border-b border-gray-800 py-2 text-sm mb-4 outline-none focus:border-green-500 text-white"
              value={vaccineName}
              onChange={(e) => setVaccineName(e.target.value)}
            />
            <button 
              onClick={handleSaveVaccine}
              disabled={!vaccineName.trim() || dataLoading}
              className="text-[10px] font-bold text-green-500 uppercase tracking-tighter hover:underline disabled:opacity-50"
            >
              + Log Vaccine Entry
            </button>
          </section>

          {/* Quick Links */}
          <section className="grid grid-cols-3 gap-3">
            <a href="/batches" className="bg-gray-800/50 p-4 rounded-2xl text-center">
              <div className="text-2xl mb-1">🐣</div>
              <div className="text-[10px] font-bold">Batches</div>
            </a>
            <a href="/inventory" className="bg-gray-800/50 p-4 rounded-2xl text-center">
              <div className="text-2xl mb-1">📦</div>
              <div className="text-[10px] font-bold">Inventory</div>
            </a>
            <a href="/expenses" className="bg-gray-800/50 p-4 rounded-2xl text-center">
              <div className="text-2xl mb-1">💸</div>
              <div className="text-[10px] font-bold">Expenses</div>
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}