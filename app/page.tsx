"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { MoveRight, Activity, BarChart3, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      {/* Container Utama: Responsive Width (w-full di HP, max-w-xl di Laptop) */}
      <div className="w-full max-w-xl text-center space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-sky-100 text-sky-600 rounded-2xl mb-2 shadow-sm">
            <Activity size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
            Roti Run Stats <span className="text-sky-500">.</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed">
            Ubah keringatmu menjadi data yang indah.{" "}
            <br className="hidden md:block" />
            Analisis olahraga yang estetik, simpel, dan mendalam.
          </p>
        </div>

        {/* Conditional Rendering: Login vs Belum Login */}
        {session ? (
          // === TAMPILAN SUDAH LOGIN ===
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-100/50">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={session.user?.image || ""}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-sky-100 shadow-sm object-cover"
                />
                <div className="absolute bottom-0 right-0 bg-green-400 w-6 h-6 rounded-full border-4 border-white"></div>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-800">
                Hi, {session.user?.name?.split(" ")[0]}! 👋
              </h2>
              <p className="text-slate-400 text-sm mb-8">
                Siap melihat progress larimu hari ini?
              </p>

              <div className="w-full grid grid-cols-1 gap-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full py-3.5 px-6 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-sky-200"
                >
                  Buka Dashboard <BarChart3 size={20} />
                </button>
                <button
                  onClick={() => signOut()}
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors"
                >
                  Keluar Akun
                </button>
              </div>
            </div>
          </div>
        ) : (
          // === TAMPILAN BELUM LOGIN ===
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            {/* Fitur Highlight Kecil (Pemanis) */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
                  <Zap size={20} />
                </div>
                <span className="text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Speed
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                  <BarChart3 size={20} />
                </div>
                <span className="text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Stats
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                  <Activity size={20} />
                </div>
                <span className="text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Health
                </span>
              </div>
            </div>

            <button
              onClick={() => signIn("strava")}
              className="group w-full relative overflow-hidden bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-slate-800 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-95"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {/* Icon Strava Putih Polos biar elegan */}
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-orange-500 group-hover:text-orange-400 transition-colors"
                >
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
                Connect with Strava
              </span>
            </button>
            <p className="mt-5 text-xs text-slate-400 px-4 leading-relaxed">
              Dengan masuk, kamu mengizinkan kami membaca data aktivitas
              publikmu. Tenang, datamu aman.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
