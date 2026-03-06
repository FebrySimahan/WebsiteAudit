import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authUtils } from "../../services/api";
import Layout from "../../components/Layout/Direksi/Layout.tsx";
import permintaanDataService from "../../services/permintaanDataService";
import type { PermintaanDataItem } from "../../services/permintaanDataService"
import temuanDataService from "../../services/temuanService"
import type { TemuanItem } from "../../services/temuanService";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Spinner } from "@/components/ui/spinner";

const DireksiDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [permintaanData, setPermintaanData] = useState<PermintaanDataItem[]>([]);
  const [temuanData, setTemuanData] = useState<TemuanItem[]>([]);
  const [loading, setLoading] = useState(true);


  const getTingkatParah = () => {
    if (temuanData.length === 0) return { tingkatParah: "-", count: 0 };

    let rendah = 0, sedang = 0, tinggi = 0;

    temuanData.forEach(temuan => {
      if (temuan.tingkat_keparahan === "Rendah") rendah++;
      else if (temuan.tingkat_keparahan === "Sedang") sedang++;
      else if (temuan.tingkat_keparahan === "Tinggi") tinggi++;
    });

    if (rendah > sedang && rendah > tinggi) {
      return { tingkatParah: "Rendah", count: rendah };
    } else if (sedang > rendah && sedang > tinggi) {
      return { tingkatParah: "Sedang", count: sedang };
    } else if (tinggi > 0) {
      return { tingkatParah: "Tinggi", count: tinggi };
    }

    return { tingkatParah: "-", count: 0 };
  };

  const warnaCard = (tingkatParah: string) => {
    if (tingkatParah === "Rendah") return "text-blue-600";
    if (tingkatParah === "Sedang") return "text-yellow-600";
    if (tingkatParah === "Tinggi") return "text-red-600";
    return "text-gray-600";
  };

  const topTerparah = getTingkatParah();

  const getChartData = () => {
    let rendah = 0, sedang = 0, tinggi = 0;

    temuanData.forEach(temuan => {
      if (temuan.tingkat_keparahan === "Rendah") rendah++;
      else if (temuan.tingkat_keparahan === "Sedang") sedang++;
      else if (temuan.tingkat_keparahan === "Tinggi") tinggi++;
    });

    return [
      { name: "Rendah", value: rendah },
      { name: "Sedang", value: sedang },
      { name: "Tinggi", value: tinggi }
    ].filter(item => item.value > 0);
  };

  const COLORS = {
    Rendah: "#3b82f6",
    Sedang: "#f59e0b",
    Tinggi: "#ef4444"
  };


  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        const userData = await authUtils.getUser();
        setUser(userData);

        const [permintaanDataRes, temuanDataRes] = await Promise.all([
          permintaanDataService.getAll(),
          temuanDataService.getAll()
        ]);

        setPermintaanData(permintaanDataRes);
        setTemuanData(temuanDataRes);
      } catch (err: any) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const StatCard = ({ label, value, value2, color, bgColor, onClick }: any) => (
    <div className={`bg-white rounded-lg p-6 border ${color} transition overflow-hidden`}>
      <h2 className={`text-lg sm:text-2xl font-bold ${color} mb-2 break-words leading-tight`}>{label}</h2>
      <div className="mb-4">
        {loading ? (
          <>
            <Spinner className="size-8" />
          </>
        ) : (
          <>
            <p className={`text-4xl sm:text-5xl md:text-6xl font-bold ${color} break-words leading-tight`}>{value}</p>

          </>
        )}
      </div>
      {onClick && (
        <button onClick={onClick} className={`px-4 py-2 rounded transition font-semibold text-sm sm:text-base w-full sm:w-auto ${bgColor} ${color} whitespace-normal`}>
          Lihat Detail
        </button>

      )}
      <p className={` text-xl sm:text-xl md:text-xl font-bold ${color} break-words leading-tight`}>{value2}</p>
    </div>
  );


  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <Layout>
      <div className="min-h-screen bg-white p-5">
        <div className="p-4 ">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-purple-900">Dashboard</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              label="Total Ikhtisar Temuan"
              value={permintaanData.length}
              color="text-purple-600"
              bgColor="bg-purple-100"
              onClick={() => navigate("/direksi/permintaan-data")}
            />

            <StatCard
              label="Temuan Audit"
              value={temuanData.length}
              color="text-green-600"
              bgColor="bg-green-100"
              onClick={() => navigate("/direksi/temuan-data")}
            />

            <StatCard
              label="Temuan Terbanyak"
              value={topTerparah.count}
              value2={`Temuan tingkat ${topTerparah.tingkatParah}`}
              color={
                topTerparah.tingkatParah === "Rendah" ? "text-blue-600" :
                  topTerparah.tingkatParah === "Sedang" ? "text-yellow-600" :
                    topTerparah.tingkatParah === "Tinggi" ? "text-red-600" :
                      "text-gray-600"
              }
              textColor={warnaCard(topTerparah.tingkatParah)}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full" style={{ maxWidth: "100vw" }}>
            <div className="bg-white rounded-lg -lg px-1 sm:px-2 py-4 sm:py-6 border border-purple-600 transition">
              <h2 className="text-lg sm:text-2xl font-bold text-purple-900 mb-4 px-2 sm:px-4">Chart Tingkat Keparahan Temuan</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-slate-600">Memuat chart...</p>
                  </div>
                </div>
              ) : getChartData().length > 0 ? (
                <div className="flex justify-center w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height={200} minWidth={250}>
                    <PieChart>
                      <Pie
                        data={getChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={45}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getChartData().map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} temuan`} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Tidak ada data temuan</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </Layout >
  );
};

export default DireksiDashboard;
