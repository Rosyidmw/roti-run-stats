"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  getActivities,
  getAthleteStats,
  formatDistance,
  formatDuration,
  Activity,
  AthleteStats,
} from "@/lib/strava";
import {
  Trophy,
  Flame,
  Timer,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Bike,
  Footprints,
  Dumbbell,
  Medal,
  Zap,
} from "lucide-react";

// Helper: Hitung Pace (Menit per KM)
const calculatePace = (speed: number) => {
  if (speed === 0) return "-";
  const minutesPerKm = 16.6667 / speed;
  const min = Math.floor(minutesPerKm);
  const sec = Math.floor((minutesPerKm - min) * 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec} /km`;
};

// Helper: Hitung Speed (KM/H)
const calculateSpeedKmH = (speed: number) => {
  return (speed * 3.6).toFixed(1);
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<AthleteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session?.accessToken) {
      const fetchData = async () => {
        try {
          const userId = session.user.id || "";
          const [activitiesData, statsData] = await Promise.all([
            getActivities(session.accessToken as string),
            getAthleteStats(session.accessToken as string, userId),
          ]);

          setActivities(activitiesData);
          setStats(statsData);
        } catch (error) {
          console.error("Gagal ambil data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [status, session, router]);

  // === FILTER TABS ===
  const filteredActivities = activities.filter((act) => {
    if (activeTab === "All") return true;
    if (activeTab === "Run") return act.type === "Run";
    if (activeTab === "Ride") return act.type === "Ride";
    if (activeTab === "Walk") return act.type === "Walk" || act.type === "Hike";
    return act.type === activeTab;
  });

  // === CARI BEST EFFORTS (GLOBAL) ===
  const getBestStats = (type: string) => {
    const relevantActs = activities.filter((a) => a.type === type);
    if (relevantActs.length === 0) return null;

    // 1. Cari Jarak Terjauh
    const longest = relevantActs.reduce((prev, current) =>
      prev.distance > current.distance ? prev : current
    );

    // 2. Cari Pace/Avg Speed Tercepat (Untuk Lari/Sepeda Umum)
    const fastestAvg = relevantActs.reduce((prev, current) =>
      prev.average_speed > current.average_speed ? prev : current
    );

    // 3. [BARU] Cari Top Speed Absolut (Khusus Sepeda)
    // Bandingkan max_speed antar aktivitas
    const absoluteMaxSpeed = relevantActs.reduce((prev, current) =>
      prev.max_speed > current.max_speed ? prev : current
    );

    return { longest, fastestAvg, absoluteMaxSpeed };
  };

  // === LOGIKA LEADERBOARD ===
  const getTop3RidesInclusive = (minKm: number) => {
    return activities
      .filter((a) => a.type === "Ride" && a.distance >= minKm * 1000)
      .sort((a, b) => b.average_speed - a.average_speed)
      .slice(0, 3);
  };

  const runBests = getBestStats("Run");
  const rideBests = getBestStats("Ride");

  // Leaderboard Data
  const top5kRides = getTop3RidesInclusive(5);
  const top10kRides = getTop3RidesInclusive(10);
  const top20kRides = getTop3RidesInclusive(20);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sky-600">
        <div className="animate-pulse flex flex-col items-center">
          <Flame size={48} className="mb-4" />
          <p className="font-medium">Mengambil data lari...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-100 transition"
          >
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Dashboard Statistik
            </h1>
            <p className="text-slate-400 text-sm">Overview aktivitas kamu.</p>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex flex-wrap gap-2">
          {["All", "Run", "Ride", "Walk"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? "bg-slate-800 text-white shadow-lg shadow-slate-300 scale-105"
                  : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab === "Run" && <Flame size={16} />}
              {tab === "Ride" && <Bike size={16} />}
              {tab === "Walk" && <Footprints size={16} />}
              {tab === "All" && <Medal size={16} />}
              {tab === "All"
                ? "Semua"
                : tab === "Run"
                ? "Lari"
                : tab === "Ride"
                ? "Sepeda"
                : "Jalan"}
            </button>
          ))}
        </div>

        {/* === SECTION HIGHLIGHT (LARI) === */}
        {activeTab === "Run" && runBests && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 p-5 rounded-2xl text-white shadow-lg shadow-orange-200 relative overflow-hidden">
              <Trophy className="absolute right-2 bottom-2 opacity-20 w-24 h-24 rotate-12" />
              <p className="text-orange-100 text-sm font-medium mb-1">
                Lari Terjauh
              </p>
              <h3 className="text-3xl font-bold">
                {formatDistance(runBests.longest.distance)}
              </h3>
              <p className="text-xs mt-2 opacity-90">{runBests.longest.name}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-5 rounded-2xl text-white shadow-lg shadow-blue-200 relative overflow-hidden">
              <Timer className="absolute right-2 bottom-2 opacity-20 w-24 h-24 -rotate-12" />
              <p className="text-blue-100 text-sm font-medium mb-1">
                Pace Tercepat
              </p>
              {/* Gunakan fastestAvg untuk lari */}
              <h3 className="text-3xl font-bold">
                {calculatePace(runBests.fastestAvg.average_speed)}
              </h3>
              <p className="text-xs mt-2 opacity-90">
                {runBests.fastestAvg.name}
              </p>
            </div>
          </div>
        )}

        {/* === SECTION LEADERBOARD SEPEDA (Fix Logic Max Speed) === */}
        {activeTab === "Ride" && (
          <div className="space-y-6">
            {/* Highlight Card */}
            {rideBests && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-5 rounded-2xl text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
                  <Bike className="absolute right-2 bottom-2 opacity-20 w-24 h-24 rotate-12" />
                  <p className="text-emerald-100 text-sm font-medium mb-1">
                    Gowes Terjauh (Bulan Ini)
                  </p>
                  <h3 className="text-3xl font-bold">
                    {formatDistance(rideBests.longest.distance)}
                  </h3>
                  <p className="text-xs mt-2 opacity-90 text-emerald-100">
                    {rideBests.longest.name}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-purple-400 to-violet-500 p-5 rounded-2xl text-white shadow-lg shadow-purple-200 relative overflow-hidden">
                  <Zap className="absolute right-2 bottom-2 opacity-20 w-24 h-24 -rotate-12" />
                  <p className="text-purple-100 text-sm font-medium mb-1">
                    Top Speed (Max Absolute)
                  </p>
                  {/* DISINI PERUBAHANNYA: Pakai absoluteMaxSpeed, bukan fastestAvg */}
                  <h3 className="text-3xl font-bold">
                    {calculateSpeedKmH(rideBests.absoluteMaxSpeed.max_speed)}{" "}
                    <span className="text-lg">km/h</span>
                  </h3>
                  <p className="text-xs mt-2 opacity-90 text-purple-100">
                    {rideBests.absoluteMaxSpeed.name}
                  </p>
                </div>
              </div>
            )}

            {/* === 3 KOLOM PODIUM === */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <LeaderboardCard
                title="🔥 Best 5K (Avg Speed)"
                activities={top5kRides}
                color="orange"
                targetKm={5}
              />
              <LeaderboardCard
                title="🚀 Best 10K (Avg Speed)"
                activities={top10kRides}
                color="blue"
                targetKm={10}
              />
              <LeaderboardCard
                title="👑 Best 20K (Avg Speed)"
                activities={top20kRides}
                color="purple"
                targetKm={20}
              />
            </div>
          </div>
        )}

        {/* LIST HISTORY */}
        <div>
          <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-sky-500" />
            {activeTab === "All"
              ? "Riwayat Semua Aktivitas"
              : `Riwayat ${activeTab}`}
          </h2>

          <div className="space-y-3">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl
                      ${
                        activity.type === "Run"
                          ? "bg-orange-50 text-orange-500"
                          : activity.type === "Ride"
                          ? "bg-emerald-50 text-emerald-500"
                          : activity.type === "WeightTraining"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-blue-50 text-blue-500"
                      }`}
                    >
                      {activity.type === "Run" && <Flame size={20} />}
                      {activity.type === "Ride" && <Bike size={20} />}
                      {activity.type === "Walk" && <Footprints size={20} />}
                      {activity.type === "WeightTraining" && (
                        <Dumbbell size={20} />
                      )}
                      {!["Run", "Ride", "Walk", "WeightTraining"].includes(
                        activity.type
                      ) && <span>🏃</span>}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 group-hover:text-sky-600 transition">
                        {activity.name}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium">
                          {activity.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />{" "}
                          {new Date(activity.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-lg">
                      {formatDistance(activity.distance)}
                    </p>
                    <div className="flex items-center justify-end gap-1 text-slate-500 text-xs font-mono">
                      <Timer size={12} />
                      {formatDuration(activity.moving_time)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-400">
                  Tidak ada aktivitas {activeTab} di riwayat terbaru.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// === KOMPONEN LEADERBOARD ===
function LeaderboardCard({
  title,
  activities,
  color,
  targetKm,
}: {
  title: string;
  activities: Activity[];
  color: string;
  targetKm: number;
}) {
  const colorClass =
    color === "orange"
      ? "text-orange-600 bg-orange-50"
      : color === "blue"
      ? "text-blue-600 bg-blue-50"
      : "text-purple-600 bg-purple-50";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-full">
      <h3
        className={`font-bold mb-4 flex items-center gap-2 ${colorClass} px-3 py-1.5 rounded-lg w-fit text-sm`}
      >
        {title}
      </h3>
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((act, index) => (
            <div key={act.id} className="flex items-start gap-3">
              <div
                className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5
                ${
                  index === 0
                    ? "bg-yellow-400 shadow-yellow-200"
                    : index === 1
                    ? "bg-slate-300"
                    : "bg-orange-300"
                }
              `}
              >
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700 truncate leading-tight">
                  {act.name}
                </p>

                <div className="mt-2 flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">
                      Avg Speed
                    </p>
                    <p className="text-sm font-bold text-sky-600">
                      {calculateSpeedKmH(act.average_speed)}{" "}
                      <span className="text-[10px]">km/h</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase">
                      Max Speed
                    </p>
                    <p className="text-sm font-mono font-bold text-orange-500">
                      {calculateSpeedKmH(act.max_speed)}{" "}
                      <span className="text-[10px]">km/h</span>
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 mt-1 text-right flex justify-between">
                  <span>📏 {formatDistance(act.distance)}</span>
                  <span>⏱ {formatDuration(act.moving_time)} (Total)</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-20 flex items-center justify-center">
          <p className="text-xs text-slate-400 italic text-center">
            Belum ada ride sejauh {targetKm}km.
          </p>
        </div>
      )}
    </div>
  );
}
