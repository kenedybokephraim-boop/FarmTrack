"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const { loading, register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !fullName) {
      setError("Please fill in all fields");
      return;
    }

    const result = await register(email, fullName, password, "Poultry");

    if (result.success) {
      toast.success("Registration successful! Please log in.");
      router.push("/setup-profile");
    } else {
      toast.error("Registration failed. Please try again.");
      setError(result.error || "Registration failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030507]">
        <div className="text-emerald-500 pulse-subtle">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={`w-full max-w-sm space-y-8 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 3v3m0-3h3m-3 0H9m3-6a3 3 0 11-6 0 3 3 0 016 0zm6 3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            FarmTrack
          </h1>
          <p className="mt-2 text-slate-400 text-sm">Create your account</p>
        </div>

        <div className="glass-card rounded-2xl p-6 slide-up">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium ml-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="glass-input w-full p-4 rounded-xl text-white"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium ml-1">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="glass-input w-full p-4 rounded-xl text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium ml-1">Password</label>
              <input
                type="password"
                placeholder="Create a password"
                className="glass-input w-full p-4 rounded-xl text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 rounded-xl text-white font-bold mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="text-center">
          <span className="text-slate-500 text-sm">Already have an account? </span>
          <Link href="/login" className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
