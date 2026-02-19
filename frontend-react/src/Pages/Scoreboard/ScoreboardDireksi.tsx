import { useEffect, useState } from "react";
import Layout from "../../components/Layout/Direksi/Layout.tsx";
import scoreboardService from "../../services/scoreboardService.ts";
import type { ScoreboardItem } from "../../services/scoreboardService.ts";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const ScoreboardDireksi = () => {
    const [scoreboard, setScoreboard] = useState<ScoreboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRole, setSelectedRole] = useState<ScoreboardItem | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchScoreboard();
    }, []);

    const fetchScoreboard = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await scoreboardService.getScoreboard();
            setScoreboard(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal memuat scoreboard");
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (poin: number) => {
        if (poin >= 95) return "text-green-600";
        if (poin >= 80) return "text-blue-600";
        if (poin >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Scoreboard
                    </h1>
                </div>


                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-slate-600">Memuat scoreboard...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {scoreboard.map((item, nomer) => (
                            <div key={item.level_role} className="space-y-3">
                                <div
                                    className="bg-white rounded-lg shadow p-3 sm:p-4 w-full transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                                >
                                    <div className="flex items-center gap-2 sm:gap-4">
                                        <span className="text-lg sm:text-xl font-bold text-slate-900 w-8">
                                            #{nomer + 1}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-blue-100 text-blue-800 min-w-20 text-center">
                                            {item.level_role}
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 w-full sm:w-auto">
                                        <div className="text-right">
                                            <span className={`text-xl sm:text-2xl font-bold ${getScoreColor(item.poin)}`}>
                                                {item.poin}
                                            </span>
                                            <p className="text-xs text-slate-500">Poin / {item.user_count} user</p>
                                        </div>

                                        <div className="flex gap-2 text-xs sm:text-sm">
                                            <div className="bg-green-50 rounded px-2 py-1 text-center">
                                                <p className="text-xs text-green-700 font-medium">Rendah</p>
                                                <p className="text-sm font-bold text-green-600">
                                                    {item.detail_temuan.Rendah}
                                                </p>
                                            </div>
                                            <div className="bg-yellow-50 rounded px-2 py-1 text-center">
                                                <p className="text-xs text-yellow-700 font-medium">Sedang</p>
                                                <p className="text-sm font-bold text-yellow-600">
                                                    {item.detail_temuan.Sedang}
                                                </p>
                                            </div>
                                            <div className="bg-red-50 rounded px-2 py-1 text-center">
                                                <p className="text-xs text-red-700 font-medium">Tinggi</p>
                                                <p className="text-sm font-bold text-red-600">
                                                    {item.detail_temuan.Tinggi}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setSelectedRole(item);
                                                setShowDetailsModal(true);
                                            }}
                                            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium text-xs sm:text-sm w-full sm:w-auto"
                                        >
                                            Detail
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showDetailsModal && selectedRole && (
                    <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Semua Temuan - {selectedRole.level_role}</DialogTitle>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-4">
                                {selectedRole.temuans && selectedRole.temuans.length > 0 ? (
                                    selectedRole.temuans.map((temuan) => (
                                        <div
                                            key={temuan.id_temuan}
                                            className="bg-gray-50 rounded p-3 text-sm border-pink-700 flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{temuan.judul_temuan}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span>Tingkat Keparahan : </span>
                                                    <span className={`text-xs px-2 py-1 rounded font-semibold ${temuan.tingkat_keparahan === 'Tinggi' ? 'bg-red-100 text-red-700' :
                                                        temuan.tingkat_keparahan === 'Sedang' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {temuan.tingkat_keparahan}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded font-medium ${temuan.status_temuan === 'Selesai' ? 'bg-green-100 text-green-700' :
                                                temuan.status_temuan === 'Menunggu Verifikasi' ? 'bg-blue-100 text-blue-700' :
                                                    temuan.status_temuan === 'Menunggu Tindaklanjut' ? 'bg-purple-100 text-purple-700' :
                                                        temuan.status_temuan === 'Terbuka' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                }`}>
                                                {temuan.status_temuan}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-4">Tidak ada temuan</p>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

            </div>
        </Layout>
    );
};

export default ScoreboardDireksi;
