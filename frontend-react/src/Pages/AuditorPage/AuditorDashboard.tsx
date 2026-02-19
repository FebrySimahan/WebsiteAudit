import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuditorLayout from "@/components/Layout/Auditor/AuditorLayout";
import temuanService from "@/services/temuanService";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/services/api";

interface DashboardStats {
  totalTemuan: number;
  totalPermintaan: number;
  totalSuratTugas: number;
}

const AuditorDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTemuan: 0,
    totalPermintaan: 0,
    totalSuratTugas: 0,
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const userStr = sessionStorage.getItem("cached_user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUserName(userData.data?.name || "");
      }

      const [temuanData, permintaanDataRes, suratRes] = await Promise.all([
        temuanService.getAll(),
        api.get("/permintaan-data/direksi"),
        api.get("/surat-tugas")
      ]);

      const totalPermintaan = permintaanDataRes.data?.pagination?.total ?? (Array.isArray(permintaanDataRes.data.data) ? permintaanDataRes.data.data.length : 0);

      setStats({
        totalTemuan: Array.isArray(temuanData) ? temuanData.length : 0,
        totalPermintaan,
        totalSuratTugas: Array.isArray(suratRes.data.data) ? suratRes.data.data.length : 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, borderColor, textColor }: any) => (
    <div className={`bg-white rounded-lg p-6 border ${borderColor} transition overflow-hidden`}>
      <h2 className={`text-lg sm:text-2xl font-bold ${textColor} mb-2 break-words leading-tight`}>{label}</h2>
      <div className="mb-2">
        <p className={`text-4xl sm:text-5xl md:text-6xl font-bold ${textColor} break-words leading-tight`}>{value}</p>
      </div>

      {label === "Total Temuan" ? (
        <button
          onClick={() => navigate("/auditor/temuan")}
          className="bg-blue-600 text-white px-4 py-2 rounded transition font-semibold text-sm sm:text-base w-full sm:w-auto whitespace-normal"
        >
          Lihat Temuan
        </button>
      ) : label === "Total Permintaan" ? (
        <button
          onClick={() => navigate("/auditor/permintaan-data")}
          className="bg-green-600 text-white px-4 py-2 rounded transition font-semibold text-sm sm:text-base w-full sm:w-auto whitespace-normal"
        >
          Lihat Permintaan
        </button>
      ) : label === "Total Surat Tugas" ? (
        <button
          onClick={() => navigate("/auditor/surat-tugas")}
          className="bg-orange-600 text-white px-4 py-2 rounded transition font-semibold text-sm sm:text-base w-full sm:w-auto whitespace-normal"
        >
          Lihat Surat Tugas
        </button>
      ) : null}
    </div>


  );

  return (
    <AuditorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Auditor
          </h1>
          <p className="text-gray-600">
            Selamat datang, {userName}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                label="Total Temuan"
                value={stats.totalTemuan}
                borderColor="border-blue-600"
                textColor="text-blue-600"

              />
              <StatCard
                label="Total Permintaan"
                value={stats.totalPermintaan}
                borderColor="border-green-600"
                textColor="text-green-600"
              />
              <StatCard
                label="Total Surat Tugas"
                value={stats.totalSuratTugas}
                borderColor="border-orange-600"
                textColor="text-orange-600"
              />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Ringkasan Audit
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Total Kegiatan Audit</span>
                  <span className="text-xl font-bold text-blue-600">{stats.totalPermintaan}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Total Temuan Teridentifikasi</span>
                  <span className="text-xl font-bold text-red-600">{stats.totalTemuan}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Total Penugasan Audit</span>
                  <span className="text-xl font-bold text-orange-600">{stats.totalSuratTugas}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AuditorLayout>
  );
};

export default AuditorDashboard;
