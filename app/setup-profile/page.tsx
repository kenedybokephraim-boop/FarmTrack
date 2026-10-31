"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/hooks/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SetupProfile() {
  const [fullName, setFullName] = useState("");
  const [birdTypes, setBirdTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const farmerId = localStorage.getItem('farmer_id');
    if (!farmerId) {
      router.push('/register');
    }
  }, [router]);

  const toggleBirdType = (type: string) => {
    setBirdTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const farmerId = localStorage.getItem('farmer_id');
    if (!farmerId) {
      toast.error("Session expired. Please register again.");
      router.push('/register');
      setLoading(false);
      return;
    }

    if (birdTypes.length === 0) {
      toast.error("Please select at least one bird type.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('farmers')
      .update({
        full_name: fullName,
        farm_type: 'Poultry',
        bird_types: birdTypes
      })
      .eq('id', farmerId);

    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.success(`Welcome to the community, ${fullName}!`, {
        description: 'Your farm profile has been created successfully.'
      });
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#030507] text-white p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-500">Customize Your Poultry Vault</h1>
          <p className="text-gray-400 mt-2">Tailor your AI diagnosis for your flock.</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Musa Ibrahim"
              className="w-full p-4 rounded bg-gray-900 border border-gray-700 mt-1"
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Select Bird Type</label>
            <div className="flex flex-col gap-3">
              {['Layers', 'Broilers'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleBirdType(type)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition ${
                    birdTypes.includes(type)
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-green-500/50'
                  }`}
                >
                  <span className="font-medium">{type}</span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                      birdTypes.includes(type)
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-600'
                    }`}
                  >
                    {birdTypes.includes(type) && (
                      <span className="text-white text-xs font-bold">✓</span>
                    )}
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={() => toggleBirdType('Layers & Broilers')}
                className={`flex items-center justify-between p-4 rounded-xl border transition ${
                  birdTypes.includes('Layers & Broilers')
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-green-500/50'
                }`}
              >
                <span className="font-medium">Layers & Broilers</span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    birdTypes.includes('Layers & Broilers')
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-600'
                  }`}
                >
                  {birdTypes.includes('Layers & Broilers') && (
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                </div>
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-green-600 py-4 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Finish Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}