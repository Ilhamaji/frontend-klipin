"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Cookies from "js-cookie";
import { login } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await login(username, password);
      if (res?.error) {
        setError(res.message || "Gagal masuk. Silakan periksa kembali data Anda.");
      } else if (res?.data?.token) {
        Cookies.set("auth_token", res.data.token, { expires: 7 });
        router.push("/");
      } else {
        setError("Respon server tidak valid.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kendala saat melakukan login. Silakan coba lagi.");
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
              <Image
                src="/klipin.png"
                alt="Klipin Logo"
                width={160}
                height={80}
                priority
                className="w-auto h-20 object-contain"
              />
              <span className="self-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200/60 rounded-full select-none">
                Demo
              </span>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 text-center mb-6">
              Selamat Datang
            </h2>

            <form onSubmit={handleLogin} className="space-y-5">
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
                <label className="text-xs font-medium text-slate-600 ml-1">
                  Password
                </label>
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
              {/* Btn submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#0f766e] hover:bg-[#0d645d] text-white rounded-lg font-medium text-sm transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:active:scale-100"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      Masuk
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Link ke register page */}
            <p className="text-center text-xs text-slate-500 mt-4">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-[#0f766e] font-medium hover:underline"
              >
                Register sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
