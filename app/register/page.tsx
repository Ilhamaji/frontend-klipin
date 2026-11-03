"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setErrors([]);

    try {
      await register(username, password);
      router.push("/login");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.data && Array.isArray(err.data)) {
        const messages = err.data.map((item: any) => item.message || String(item));
        setErrors(messages);
      } else if (err?.message) {
        setErrors([err.message]);
      } else {
        setErrors(["Terjadi kesalahan saat mendaftar akun. Silakan coba lagi nanti."]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen-dvh flex flex-col items-center justify-center bg-[#f8fafc] font-sans selection:bg-[#0f766e]/20 px-4 py-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:flex-row lg:gap-16 lg:px-12">
      {/* Mirrors the login page: brand panel on the left from lg up, form
          card centred as before on narrower screens. */}
      <div className="hidden lg:flex lg:max-w-md lg:flex-1 lg:flex-col lg:justify-center">
        <Image
          src="/klipin.png"
          alt=""
          width={579}
          height={270}
          priority
          unoptimized
          style={{ width: "auto", height: "auto" }}
          className="mb-8 h-20 w-auto object-contain object-left"
        />
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">
          Mulai bangun
          <br />
          catatan risetmu.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-slate-500 max-w-sm">
          Satu akun untuk menyimpan materi, merangkum jurnal, dan menelusuri
          kembali seluruh riwayat pencarianmu.
        </p>
      </div>

      <div className="w-full max-w-[400px] lg:flex-none">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4 min-h-[64px] lg:hidden">
              <Image
                src="/klipin.png"
                alt="Klipin Logo"
                width={579}
                height={270}
                priority
                unoptimized
                // Fixed aspect ratio prevents the logo collapsing when the
                // flex row is narrow (small phones). object-contain keeps it
                // undistorted on every breakpoint.
                style={{ width: "auto", height: "auto" }}
                className="h-14 w-auto max-w-[60%] object-contain sm:h-20 sm:max-w-none"
              />
              <span className="self-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200/60 rounded-full select-none">
                Demo
              </span>
            </div>
            {/* Title */}
            <h2 className="text-xl font-semibold text-slate-800 text-center mb-6">
              Buat Akun Baru Anda
            </h2>

            {/* Form regis */}
            <form onSubmit={handleRegister} className="space-y-5">
              {errors.length > 0 && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
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
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 text-base sm:text-sm bg-[#f1f5f9] rounded-lg border border-transparent focus:bg-white focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20 text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200"
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
                  <span className="text-[11px] text-slate-500 ml-1">
                    Minimal 8 karakter, kombinasi huruf besar, kecil, dan angka.
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
                    autoComplete="new-password"
                    className="w-full pl-10 pr-12 py-3 text-base sm:text-sm bg-[#f1f5f9] rounded-lg border border-transparent focus:bg-white focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20 text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 tracking-wide font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none"
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
                  className="w-full min-h-[44px] py-3 px-4 bg-[#0f766e] hover:bg-[#0d645d] text-white rounded-lg font-medium text-sm transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:active:scale-100"
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

            <p className="text-center text-xs text-slate-500 mt-4">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-[#0f766e] font-medium hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
