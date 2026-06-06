"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await register(username, password);

      if (res.error) {
        setError(res.message || "Register failed");
      } else {
        router.push("/login");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during register.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] font-sans selection:bg-[#0f766e]/20">
      <div className="w-full max-w-[400px] px-4">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img
                src="/klipin.png"
                alt="Klipin Logo"
                className="w-auto h-30 object-contain"
              />
            </div>
            {/* Title */}
            <h2 className="text-xl font-semibold text-slate-800 text-center mb-6">
              Buat Akun Baru Anda
            </h2>

            {/* Form regis */}
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                  {error}
                </div>
              )}
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 ml-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username 123"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f1f5f9] rounded-lg border border-transparent focus:bg-white focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-slate-600 ml-1">
                    Password
                  </label>
                  <span className="text-[2px] text-red-500 ml-1 italic">
                    Password minimal 8 karakter, 1 huruf besar dan kecil, serta 1
                    angka.
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#f1f5f9] rounded-lg border border-transparent focus:bg-white focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 tracking-wide font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit btn */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#0f766e] hover:bg-[#0d645d] text-white rounded-lg font-medium text-sm transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:active:scale-100"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mendaftarkan...
                    </span>
                  ) : (
                    <>
                      Daftar
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Link balik ke login */}
            <p className="text-center text-xs text-slate-500 mt-4">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-[#0f766e] font-medium hover:underline"
              >
                Login sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
