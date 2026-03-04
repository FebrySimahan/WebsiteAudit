import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuditeeLayout from "@/components/Layout/Auditee/AuditeeLayout";
import temuanDataService from "@/services/temuanService";
import type { TemuanItem, TemuanPaginationInfo } from "@/services/temuanService";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";
import ModalDetailTemuan from "@/components/Modals/ModalDetailTemuan";
import ModalResponTemuan from "@/components/Modals/ModalResponTemuan";
import ModalTindakLanjut from "@/components/Modals/ModalTindakLanjut";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";

const AuditeeTemuan = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get filter from URL search params or default to "all"
    const getInitialFilter = () => {
        const params = new URLSearchParams(location.search);
        const urlFilter = params.get("filter");
        if (urlFilter && ["all", "Terbuka", "Menunggu Tindaklanjut", "Menunggu Verifikasi", "Selesai"].includes(urlFilter)) {
            return urlFilter as "all" | "Terbuka" | "Menunggu Tindaklanjut" | "Menunggu Verifikasi" | "Selesai";
        }
        return "all";
    };
    
    const [temuanData, setTemuanData] = useState<TemuanItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userRole, setUserRole] = useState<string>("");
    const [userId, setUserId] = useState<number | null>(null);
    const [showResponModal, setShowResponModal] = useState(false);
    const [selectedTemuan, setSelectedTemuan] = useState<TemuanItem | null>(null);
    const [alasanPenolakan, setAlasanPenolakan] = useState("");
    const [respondingLoading, setRespondingLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState<"all" | "Terbuka" | "Menunggu Tindaklanjut" | "Menunggu Verifikasi" | "Selesai">(getInitialFilter());
    const [searchQuery, setSearchQuery] = useState("");
    const [showTindakLanjutModal, setShowTindakLanjutModal] = useState(false);
    const [deskripsiTindakLanjut, setDeskripsiTindakLanjut] = useState("");
    const [deskripsiKomitmen, setDeskripsiKomitmen] = useState("");
    const [tindakLanjutLoading, setTindakLanjutLoading] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailTemuan, setDetailTemuan] = useState<TemuanItem | null>(null);
    const [pagination, setPagination] = useState<TemuanPaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 5;

    useEffect(() => {
        // Check if filterStatus is passed from navigation state (backward compatibility)
        if (location.state && location.state.filterStatus) {
            setFilterStatus(location.state.filterStatus);
            setCurrentPage(1);
            // Update URL to reflect the new filter
            navigate("?filter=" + encodeURIComponent(location.state.filterStatus), { replace: true });
        }
    }, [location.state, navigate]);

    // Update URL when filterStatus changes
    useEffect(() => {
        navigate("?filter=" + encodeURIComponent(filterStatus), { replace: true });
    }, [filterStatus, navigate]);

    useEffect(() => {
        fetchTemuan();
    }, [filterStatus, currentPage]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(searchQuery.trim());
            } else {
                setCurrentPage(1);
                fetchTemuan();
            }
        }, 500);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleSearch = async (query: string) => {
        try {
            setLoading(true);
            setError("");

            // Get userId directly dari sessionStorage, jangan andalkan state
            const userStr = sessionStorage.getItem("cached_user");
            let currentUserId: number | null = null;

            if (userStr) {
                const userData = JSON.parse(userStr);
                currentUserId = userData.data?.id;
            }

            const peMapping: { [key: number]: string } = {
                44: 'Kepatuhan',
                27: 'MR',
            };

            let result;
            if (currentUserId && peMapping[currentUserId]) {
                result = await temuanDataService.showByIdAuditee(currentUserId, currentPage, perPage, filterStatus);
            } else {
                result = await temuanDataService.showByAuditeeRole(currentPage, perPage, filterStatus);
            }

            let filtered = result.data;
            if (query) {
                filtered = filtered.filter((item: TemuanItem) =>
                    item.judul_temuan.toLowerCase().includes(query.toLowerCase())
                );
            }
            setTemuanData(filtered);
            setPagination(result.pagination);
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal mencari data");
        } finally {
            setLoading(false);
        }
    };

    const fetchTemuan = async () => {
        try {
            setLoading(true);
            setError("");

            const userStr = sessionStorage.getItem("cached_user");
            let currentUserId: number | null = null;

            if (userStr) {
                const userData = JSON.parse(userStr);
                const role = userData.data?.level_role;
                const id = userData.data?.id;
                setUserRole(role);
                setUserId(id);
                currentUserId = id; // Gunakan nilai langsung, bukan state
            }

            // untuk PE users, gunakan showByIdAuditee; untuk non-PE gunakan showByAuditeeRole
            const peMapping: { [key: number]: string } = {
                44: 'Kepatuhan',
                27: 'MR',
            };

            let result;
            if (currentUserId && peMapping[currentUserId]) {
                result = await temuanDataService.showByIdAuditee(currentUserId, currentPage, perPage, filterStatus);
            } else {
                result = await temuanDataService.showByAuditeeRole(currentPage, perPage, filterStatus);
            }

            setTemuanData(result.data);
            setPagination(result.pagination);
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal memuat data temuan");
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (tingkat: string) => {
        switch (tingkat?.toLowerCase()) {
            case "rendah":
                return "bg-blue-100 text-blue-800";
            case "sedang":
                return "bg-yellow-100 text-yellow-800";
            case "tinggi":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "terbuka":
                return "bg-orange-100 text-orange-800";
            case "menunggu tindaklanjut":
                return "bg-blue-100 text-blue-800";
            case "menunggu verifikasi":
                return "bg-purple-100 text-purple-800";
            case "selesai":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getFilteredTemuan = () => {
        if (filterStatus === "all") {
            return temuanData;
        }
        return temuanData.filter((item) => item.status_temuan === filterStatus);
    };

    const hasRejectedVerifikasi = (temuan: TemuanItem) => {
        return temuan.verifikasi && temuan.verifikasi.status_verifikasi === "Ditolak";
    };

    const handleResponTemuan = async (status: "Diterima" | "Ditolak") => {
        if (!selectedTemuan || !userId) return;

        try {
            setRespondingLoading(true);
            await temuanDataService.createResponTemuan({
                id_temuan: selectedTemuan.id_temuan,
                id_auditee: userId,
                status_respon: status,
            });

            await fetchTemuan();
            setShowResponModal(false);
            setSelectedTemuan(null);
            setAlasanPenolakan("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal membuat respon temuan");
            console.error("Error:", err);
        } finally {
            setRespondingLoading(false);
        }
    };

    const handleTindakLanjut = async () => {
        if (!selectedTemuan || !deskripsiTindakLanjut.trim() || !deskripsiKomitmen) return;

        try {
            setTindakLanjutLoading(true);
            await temuanDataService.createTindakLanjut({
                id_temuan: selectedTemuan.id_temuan,
                deskripsi_tindak_lanjut: deskripsiTindakLanjut,
                deskripsi_komitmen: deskripsiKomitmen,
            });

            await fetchTemuan();
            setShowTindakLanjutModal(false);
            setSelectedTemuan(null);
            setDeskripsiTindakLanjut("");
            setDeskripsiKomitmen("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal membuat tindak lanjut");
            console.error("Error:", err);
        } finally {
            setTindakLanjutLoading(false);
        }
    };


    return (
        <AuditeeLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Temuan Saya
                    </h1>
                    <p className="text-gray-600">
                        Daftar temuan dari level role {userRole}
                    </p>
                    <br />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan judul temuan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border rounded"
                    />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="flex gap-3 mb-6 flex-wrap">
                    {[
                        { value: "all" as const, label: "Semua", activeBg: "bg-blue-600", inactiveBg: "bg-gray-200" },
                        { value: "Terbuka" as const, label: "Terbuka", activeBg: "bg-yellow-600", inactiveBg: "bg-gray-200" },
                        { value: "Menunggu Tindaklanjut" as const, label: "Menunggu Tindaklanjut", activeBg: "bg-cyan-600", inactiveBg: "bg-gray-200" },
                        { value: "Menunggu Verifikasi" as const, label: "Menunggu Verifikasi", activeBg: "bg-purple-600", inactiveBg: "bg-gray-200" },
                        { value: "Selesai" as const, label: "Selesai", activeBg: "bg-green-600", inactiveBg: "bg-gray-200" },
                    ].map(({ value, label, activeBg, inactiveBg }) => (
                        <button
                            key={value}
                            onClick={() => {
                                setFilterStatus(value);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === value ? `${activeBg} text-white` : `${inactiveBg} text-gray-700`
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-48 rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {getFilteredTemuan().length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-lg">Tidak ada data temuan</p>
                            </div>
                        ) : (
                            getFilteredTemuan().map((temuan, index) => {
                                return (
                                    <div
                                        key={`temuan-${temuan.id_temuan}-${index}`}
                                        className="bg-white rounded-lg shadow-md  transition p-5 border border-gray-200"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 pr-2">
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {temuan.judul_temuan || "Temuan"}
                                                </h3>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getStatusColor(temuan.status_temuan)}`}>
                                                {temuan.status_temuan}
                                            </span>
                                        </div>

                                        <div className="mb-3 flex flex-wrap gap-2">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(temuan.tingkat_keparahan)}`}>
                                                {temuan.tingkat_keparahan}
                                            </span>
                                        </div>

                                        <div className="text-xs text-gray-500 mb-3">
                                            {new Date(temuan.tanggal_temuan).toLocaleDateString("id-ID")}
                                        </div>



                                        {temuan.status_temuan === "Menunggu Tindaklanjut" && hasRejectedVerifikasi(temuan) && (
                                            <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                                                <div className="text-xs text-red-700 leading-relaxed">
                                                    <span className="font-medium">Catatan Penolakan:</span>
                                                    <p className="text-red-700">{temuan.verifikasi?.catatan}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-2 pt-3">
                                            <button
                                                onClick={() => {
                                                    setDetailTemuan(temuan);
                                                    setShowDetailModal(true);
                                                }}
                                                className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-xs font-medium"
                                            >
                                                <Eye size={14} />
                                                Detail
                                            </button>

                                            {temuan.status_temuan === "Terbuka" &&
                                                (!temuan.responTemuans || temuan.responTemuans.length === 0 || !temuan.responTemuans.some((r: any) => r.status_respon === 'Ditolak')) && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTemuan(temuan);
                                                            setShowResponModal(true);
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-medium"
                                                    >
                                                        Tanggapi
                                                    </button>
                                                )}

                                            {temuan.status_temuan === "Menunggu Tindaklanjut" && (
                                                <>
                                                    {hasRejectedVerifikasi(temuan) ? (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTemuan(temuan);
                                                                setDeskripsiTindakLanjut("");
                                                                setDeskripsiKomitmen("");
                                                                setShowTindakLanjutModal(true);
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs font-medium"
                                                        >
                                                            Tindaklanjuti Lagi
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTemuan(temuan);
                                                                setDeskripsiTindakLanjut("");
                                                                setDeskripsiKomitmen("");
                                                                setShowTindakLanjutModal(true);
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs font-medium"
                                                        >
                                                            Buat Tindak Lanjut
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>


                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {pagination && pagination.last_page > 1 && !loading && temuanData.length > 0 && (
                    <div className="mt-6 flex flex-col items-center gap-2">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => {
                                            if (currentPage > 1) {
                                                setCurrentPage(currentPage - 1);
                                            }
                                        }}
                                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>

                                {(() => {
                                    const pages = [];
                                    const totalPages = pagination.last_page;

                                    pages.push(
                                        <PaginationItem key={1}>
                                            <PaginationLink
                                                onClick={() => setCurrentPage(1)}
                                                isActive={currentPage === 1}
                                            >
                                                1
                                            </PaginationLink>
                                        </PaginationItem>
                                    );

                                    if (currentPage > 3) {
                                        pages.push(
                                            <PaginationItem key="ellipsis-start">
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }

                                    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                                        pages.push(
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    onClick={() => {
                                                        setCurrentPage(i);
                                                    }}
                                                    isActive={currentPage === i}
                                                >
                                                    {i}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    }

                                    if (currentPage < totalPages - 2) {
                                        pages.push(
                                            <PaginationItem key="ellipsis-end">
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }

                                    if (totalPages > 1) {
                                        pages.push(
                                            <PaginationItem key={totalPages}>
                                                <PaginationLink
                                                    onClick={() => {
                                                        setCurrentPage(totalPages);
                                                    }}
                                                    isActive={currentPage === totalPages}
                                                >
                                                    {totalPages}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    }

                                    return pages;
                                })()}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => {
                                            if (currentPage < pagination.last_page) {
                                                setCurrentPage(currentPage + 1);
                                            }
                                        }}
                                        className={currentPage >= pagination.last_page ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            <ModalResponTemuan
                isOpen={showResponModal}
                onOpenChange={setShowResponModal}
                selectedTemuan={selectedTemuan}
                alasanPenolakan={alasanPenolakan}
                onAlasanPenolakanChange={setAlasanPenolakan}
                onResponDiterima={() => handleResponTemuan("Diterima")}
                onResponDitolak={() => handleResponTemuan("Ditolak")}
                isLoading={respondingLoading}
            />

            <ModalTindakLanjut
                isOpen={showTindakLanjutModal}
                onOpenChange={setShowTindakLanjutModal}
                selectedTemuan={selectedTemuan}
                deskripsiTindakLanjut={deskripsiTindakLanjut}
                onDeskripsiChange={setDeskripsiTindakLanjut}
                deskripsiKomitmen={deskripsiKomitmen}
                onDeskripsiKomitmenChange={setDeskripsiKomitmen}
                onSubmit={handleTindakLanjut}
                isLoading={tindakLanjutLoading}
                hasRejectedVerifikasi={selectedTemuan ? !!hasRejectedVerifikasi(selectedTemuan) : false}
                rejectionNote={selectedTemuan?.verifikasi?.catatan}
            />

            <ModalDetailTemuan
                isOpen={showDetailModal}
                onOpenChange={setShowDetailModal}
                temuan={detailTemuan}
                getSeverityColor={getSeverityColor}
                getStatusColor={getStatusColor}
            />
        </AuditeeLayout>
    );
};

export default AuditeeTemuan;
