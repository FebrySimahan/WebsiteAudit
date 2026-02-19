import { useEffect, useState } from "react";
import AuditeeLayout from "@/components/Layout/Auditee/AuditeeLayout";
import scoreboardService from "@/services/scoreboardService";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import temuanService from "@/services/temuanService";

const AuditeeDashboard = () => {
  const navigate = useNavigate();
  const [currentPoin, setCurrentPoin] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string>("");
  const [temuanData, setTemuanData] = useState<any[]>([]);
  const [openCount, setOpenCount] = useState<number>(0);

  useEffect(() => {
    fetchUserDataAndScore();
    fetchOpenCount();
  }, []);

  const fetchUserDataAndScore = async () => {
    try {
      setLoading(true);
      setError("");

      const userStr = sessionStorage.getItem("cached_user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        const role = userData.data?.level_role;
        setUserRole(role);

        const scoreboardData = await scoreboardService.getScoreboard();

        const roleMapping: { [key: string]: string } = {
          'KTI': 'TI',
          'BE': 'Remedial',
          'FE': 'Remedial',
          'KSR': 'Remedial',
          'TLR': 'Remedial',
          'SA': 'Landing',
          'AO': 'Landing',
          'RO': 'Landing',
          'SO': 'Landing',
          'TLL': 'Landing',
          'KSL': 'Landing',
          'FO': 'Funding',
          'KSF': 'Funding',
          'TLF': 'Funding',
        };

        let category = roleMapping[role] || 'Operational';

        if (scoreboardData.find(item => item.level_role === role)) {
          category = role;
        }

        const roleData = scoreboardData.find(item => item.level_role === category);

        if (roleData) {
          setCurrentPoin(roleData.poin);
          setTemuanData(roleData.temuans || []);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpenCount = async () => {
    try {
      const count = await temuanService.countByStatus("Terbuka");
      setOpenCount(count);
    } catch (err) {

    }
  };

  const getScoreColor = (poin: number) => {
    if (poin >= 95) return "text-green-600";
    if (poin >= 80) return "text-blue-600";
    if (poin >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (poin: number) => {
    if (poin >= 95) return "bg-green-100";
    if (poin >= 80) return "bg-blue-100";
    if (poin >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const StatCard = ({ label, value, borderColor, textColor }: any) => (
    <div className={`bg-white rounded-lg p-6 border ${borderColor} transition overflow-hidden`}>
      <h2 className={`text-lg sm:text-2xl font-bold ${textColor} mb-2 break-words leading-tight`}>{label}</h2>
      <div className="mb-2">
        <p className={`text-4xl sm:text-5xl md:text-6xl font-bold ${textColor} break-words leading-tight`}>{value}</p>
      </div>
      {label === "Total Temuan" ? (
        <button
          onClick={() => navigate("/auditee/temuan")}
          className="bg-blue-600 text-white px-4 py-2 rounded transition font-semibold text-sm sm:text-base w-full sm:w-auto whitespace-normal"
        >
          Lihat Temuan
        </button>

      ) : label === "Temuan Terbuka" ? (
        <button
          onClick={() => navigate("/auditee/temuan")}
          className="bg-yellow-600 text-white px-4 py-2 rounded transition font-semibold text-sm sm:text-base w-full sm:w-auto whitespace-normal"
        >
          Lihat Temuan
        </button>

      ) : null}
    </div>
  );

  return (
    <AuditeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="rounded-lg w-96 h-48" />

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <div>
                <StatCard
                  label="Temuan Terbuka"
                  value={openCount}
                  borderColor="border-yellow-600"
                  textColor="text-yellow-600"
                />
              </div>
              <div >
                <StatCard
                  label="Total Temuan"
                  value={temuanData.length}
                  borderColor="border-blue-600"
                  textColor="text-blue-600"
                />
              </div>
            </div>

            <div className={`${getScoreBackground(currentPoin || 0)} rounded-lg p-6 shadow`}>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Poin Saat Ini
              </h2>
              <div className="flex items-end gap-2">
                <span className={`text-5xl font-bold ${getScoreColor(currentPoin || 0)}`}>
                  {currentPoin !== null ? currentPoin : "-"}
                </span>
                <span className="text-xl font-semibold text-gray-700 mb-2">/ 100</span>
              </div>

            </div>


            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Informasi Role
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Level Role</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {userRole || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuditeeLayout>
  );
};

export default AuditeeDashboard;
