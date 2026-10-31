"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const { user, loading, login } = useAuth();
  const router = useRouter();

  // Fade animation after auth state is known
  useEffect(() => {
    if (!loading) setIsVisible(true);
  }, [loading]);

  // Redirect if logged in (exclude demo mode users so they see the sign-in form)
  useEffect(() => {
    if (!loading && user && user.id !== 'demo') {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      toast.success("Welcome back!");
      router.replace("/dashboard");
    } else {
      toast.error("Invalid credentials.");
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={`w-full max-w-sm space-y-8 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
        
        {/* Header */}
        <div className="text-center fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-10v10a1 1 0 01-1 1h-3m-1 4a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            FarmTrack
          </h1>
          <p className="mt-2 text-slate-400 text-sm">Sign in to your vault</p>
        </div>

        {/* Login Form */}
        <div className="glass-card rounded-2xl p-6 slide-up">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                className="glass-input w-full p-4 rounded-xl text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="glass-input w-full p-4 rounded-xl text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 rounded-xl text-white font-bold"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <span className="text-slate-500 text-sm">Don't have an account? </span>
          <Link href="/register" className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}