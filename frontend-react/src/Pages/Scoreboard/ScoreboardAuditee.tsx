import { useEffect, useState } from "react";
import AuditeeLayout from "@/components/Layout/Auditee/AuditeeLayout";
import scoreboardService from "@/services/scoreboardService";
import type { ScoreboardItem } from "@/services/scoreboardService";
import { authUtils } from "@/services/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Mapping dari level_role ke divisi scoreboard
const ROLE_MAPPING = {
    'KTI': 'Kepala Teknologi Informasi',
    'KSO': 'Operational',
    'KBO': 'Operational',
    'KSA': 'Operational',
    'KBL': 'Lending',
    'KSL': 'Lending',
    'TLU': 'Lending',
    'KSR': 'Lending',
    'TLM': 'Lending',
    'KBF': 'Funding',
    'KSF': 'Funding',
    'Kepatuhan': 'Kepatuhan',
    'Manajemen Resiko': 'Manajemen Resiko',
    'PE': 'PE',
};

// PE user ID mapping ke divisi
const PE_ID_MAPPING: { [key: number]: string } = {
    44: 'Kepatuhan',      // ID 44 = PE Kepatuhan
    27: 'Manajemen Resiko', // ID 27 = PE Manajemen Resiko
    39: 'Unknown',        // ID 39 = PE (no mapping yet)
};

const ScoreboardAuditee = () => {
    const [scoreboard, setScoreboard] = useState<ScoreboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRole, setSelectedRole] = useState<ScoreboardItem | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        fetchScoreboard();
        getCurrentUser();
    }, []);

    const getCurrentUser = async () => {
        try {
            const user = await authUtils.getUser();
            if (user) {
                console.log("Current user:", user);
                setCurrentUser(user);
            }
        } catch (err) {
            console.error("Gagal mengambil data user:", err);
        }
    };

    const canViewDetail = (scoreboardRole: string): boolean => {
        if (!currentUser) return false;

        const userLevel = currentUser.level_role;

        // Check jika user adalah PE berdasarkan ID
        if (userLevel === 'PE' && currentUser.id in PE_ID_MAPPING) {
            const peAssignedRole = PE_ID_MAPPING[currentUser.id];
            console.log(`PE user ID ${currentUser.id} mapped to ${peAssignedRole}, comparing with ${scoreboardRole}`);
            return peAssignedRole === scoreboardRole;
        }

        // Check berdasarkan level_role mapping untuk user biasa
        const mappedUserRole = ROLE_MAPPING[userLevel as keyof typeof ROLE_MAPPING] || userLevel;
        console.log(`Comparing user role ${userLevel} mapped to ${mappedUserRole} with scoreboard ${scoreboardRole}`);

        return mappedUserRole === scoreboardRole;
    };

    const fetchScoreboard = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await scoreboardService.getScoreboard();
            console.log("Scoreboard data:", data);
            setScoreboard(data);
        } catch (err: any) {
            console.error("Error fetching scoreboard:", err);
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
        <AuditeeLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Scoreboard
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
                                            disabled={!canViewDetail(item.level_role)}
                                            className={`px-3 sm:px-4 py-2 rounded hover:transition font-medium text-xs sm:text-sm w-full sm:w-auto ${canViewDetail(item.level_role)
                                                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                }`}
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
        </AuditeeLayout>
    );
};

export default ScoreboardAuditee;
