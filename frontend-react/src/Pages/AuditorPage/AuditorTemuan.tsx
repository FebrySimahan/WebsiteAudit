import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AuditorLayout from "@/components/Layout/Auditor/AuditorLayout";
import temuanService, { type TemuanItem, type TemuanPaginationInfo } from "@/services/temuanService";
import permintaanDataService from "@/services/permintaanDataService";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalDetailTemuan from "@/components/Modals/ModalDetailTemuan";
import ModalCreateTemuan from "@/components/Modals/ModalCreateTemuan";
import ModalVerifikasiTemuan from "@/components/Modals/ModalVerifikasiTemuan";

const AuditorTemuan = () => {
    const [temuan, setTemuan] = useState<TemuanItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<undefined | "all" | "Terbuka" | "Menunggu Tindaklanjut" | "Menunggu Verifikasi" | "Selesai">();
    const [pagination, setPagination] = useState<TemuanPaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 5;

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<TemuanItem | null>(null);
    const [createLoading, setCreateLoading] = useState(false);
    const [auditees, setAuditees] = useState<any[]>([]);
    const [permintaanDataList, setPermintaanDataList] = useState<any[]>([]);

    const [showVerifikasiModal, setShowVerifikasiModal] = useState(false);
    const [selectedTemuanForVerifikasi, setSelectedTemuanForVerifikasi] = useState<TemuanItem | null>(null);
    const [tindakLanjutData, setTindakLanjutData] = useState<any>(null);
    const [verifikasiReason, setVerifikasiReason] = useState("");
    const [verifikasiLoading, setVerifikasiLoading] = useState(false);

    const [formData, setFormData] = useState({
        id_permintaan: "",
        level_role: "",
        id_auditee: "",
        tanggal_temuan: "",
        judul_temuan: "",
        kondisi_sebenarnya: "",
        keadaan_seharusnya: "",
        penyebab: "",
        dampak: "",
        rekomendasi: "",
        tingkat_keparahan: "" as "" | "Rendah" | "Sedang" | "Tinggi",
    });

    const fetchTemuan = async () => {
        try {
            setLoading(true);
            setError("");
            if (filterStatus === 'all') {
                const result = await temuanService.getAllPaginated(currentPage, perPage);
                setTemuan(result.data);
                setPagination(result.pagination);
            } else {
                const result = await temuanService.filterByStatus(filterStatus ?? "all", currentPage, perPage);
                setTemuan(result.data);
                setPagination(result.pagination);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal memuat data");
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        try {
            setLoading(true);
            setError("");
            const result = await temuanService.searchByJudul(query);
            setTemuan(result);
            setPagination(null);
            setCurrentPage(1);
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal mencari data");
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterStatus = async (status: string) => {
        setFilterStatus(status as any);
        setCurrentPage(1);
    };

    const loadOptionsForModal = async () => {
        try {
            setError("");
            const permintaanList = await permintaanDataService.getAllDropdown();

            setPermintaanDataList(permintaanList);
            const auditeeMap = new Map();
            permintaanList.forEach((p: any) => {
                if (p.auditee && !auditeeMap.has(p.auditee.id)) {
                    auditeeMap.set(p.auditee.id, p.auditee);
                }
            });
            const auditeesList = Array.from(auditeeMap.values());
            setAuditees(auditeesList);
        } catch (err: any) {
            console.error("Error loading options:", err);
            setError("Gagal memuat data pilihan: " + (err.response?.data?.message || err.message));
        }
    }; const handleCreateClick = async () => {
        await loadOptionsForModal();
        setShowCreateModal(true);
    };

    const handleCreateTemuan = async () => {
        try {

            if (!formData.tanggal_temuan) {
                setError("Tanggal temuan harus dipilih.");
                return;
            }
            if (!formData.tingkat_keparahan) {
                setError("Tingkat keparahan harus dipilih.");
                return;
            }

            setCreateLoading(true);
            await temuanService.createTemuan({
                id_permintaan: formData.id_permintaan ? parseInt(formData.id_permintaan) : undefined,
                id_auditee: parseInt(formData.id_auditee),
                tanggal_temuan: formData.tanggal_temuan,
                judul_temuan: formData.judul_temuan,
                kondisi_sebenarnya: formData.kondisi_sebenarnya,
                keadaan_seharusnya: formData.keadaan_seharusnya,
                penyebab: formData.penyebab,
                dampak: formData.dampak,
                rekomendasi: formData.rekomendasi,
                tingkat_keparahan: formData.tingkat_keparahan as "Rendah" | "Sedang" | "Tinggi",
            });

            setShowCreateModal(false);
            setFormData({
                id_permintaan: "",
                id_auditee: "",
                level_role: "",
                tanggal_temuan: "",
                judul_temuan: "",
                kondisi_sebenarnya: "",
                keadaan_seharusnya: "",
                penyebab: "",
                dampak: "",
                rekomendasi: "",
                tingkat_keparahan: "",
            });
            fetchTemuan();
            setError("");
        } catch (err: any) {
            console.error("Error:", err);
            setError(err.response?.data?.message || "Gagal membuat temuan");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleFormChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleVerifikasiClick = async (temuan: TemuanItem) => {
        try {
            setVerifikasiLoading(true);
            const tindakLanjut = await temuanService.getTindakLanjutByTemuan(temuan.id_temuan);
            setTindakLanjutData(tindakLanjut);
            setSelectedTemuanForVerifikasi(temuan);
            setVerifikasiReason("");
            setShowVerifikasiModal(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal memuat data tindak lanjut");
            console.error("Error:", err);
        } finally {
            setVerifikasiLoading(false);
        }
    };

    const handleDoUpdate = async () => {
        if (!selectedTemuanForVerifikasi?.verifikasi?.id_verifikasi) return;
        try {
            setVerifikasiLoading(true);
            await temuanService.updateVerifikasi(
                selectedTemuanForVerifikasi.verifikasi.id_verifikasi,
                { catatan: verifikasiReason || null }
            );
            await fetchTemuan();
            setShowVerifikasiModal(false);
            setSelectedTemuanForVerifikasi(null);
            setTindakLanjutData(null);
            setVerifikasiReason("");
            setError("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal update verifikasi");
        } finally {
            setVerifikasiLoading(false);
        }
    };
    const handleVerifikasi = async (status: "Diterima" | "Ditolak") => {
        if (!selectedTemuanForVerifikasi || !tindakLanjutData) return;
        if (status === "Ditolak" && !verifikasiReason.trim()) {
            setError("Catatan penolakan harus diisi");
            return;
        }

        try {
            setVerifikasiLoading(true);
            await temuanService.createVerifikasi({
                id_tindak_lanjut: tindakLanjutData.id_tindak_lanjut,
                status_verifikasi: status,
                catatan: verifikasiReason,
                tanggal_verifikasi: new Date().toISOString().split('T')[0],
            });

            await fetchTemuan();
            setShowVerifikasiModal(false);
            setSelectedTemuanForVerifikasi(null);
            setTindakLanjutData(null);
            setVerifikasiReason("");
            setError("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal membuat verifikasi");
            console.error("Error:", err);
        } finally {
            setVerifikasiLoading(false);
        }
    };

    const location = useLocation();
    const [isFilterInitialized, setIsFilterInitialized] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const statusParam = params.get("status");
        if (
            statusParam &&
            ["Terbuka", "Menunggu Tindaklanjut", "Menunggu Verifikasi", "Selesai"].includes(statusParam)
        ) {
            setFilterStatus(statusParam as any);
            setIsFilterInitialized(true);
        } else {
            setFilterStatus("all");
            setIsFilterInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (!isFilterInitialized || filterStatus === undefined) return;
        fetchTemuan();
    }, [filterStatus, currentPage, isFilterInitialized]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(searchQuery);
            } else {
                setCurrentPage(1);
                if (isFilterInitialized && filterStatus !== undefined) {
                    fetchTemuan();
                }
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, isFilterInitialized, filterStatus]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Selesai":
                return "bg-green-100 text-white-800";
            case "Menunggu Tindaklanjut":
                return "bg-cyan-100 text-cyan-800";
            case "Menunggu Verifikasi":
                return "bg-purple-100 text-purple-800";
            case "Terbuka":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getKeparahanColor = (keparahan: string) => {
        switch (keparahan) {
            case "Rendah":
                return "bg-blue-100 text-blue-800";
            case "Sedang":
                return "bg-yellow-100 text-yellow-800";
            case "Tinggi":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading && temuan.length === 0) {
        return (
            <AuditorLayout>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </AuditorLayout>
        );
    }

    return (
        <AuditorLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Temuan Audit</h1>
                    <Button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700">
                        + Buat Temuan
                    </Button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <Input
                        type="text"
                        placeholder="Cari berdasarkan judul temuan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>

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
                            onClick={() => handleFilterStatus(value)}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === value ? `${activeBg} text-white` : `${inactiveBg} text-gray-700`
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 mb-4"></div>
                            <p className="text-slate-600">Memuat data...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {temuan.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Tidak ada data temuan
                            </div>
                        ) : (
                            temuan.map((item, index) => (
                                <div
                                    key={`temuan-${item.id_temuan}-${index}`}
                                    className="bg-white rounded-lg p-5 border border-blue-500 transition"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-800 flex-1 pr-2">
                                            {item.permintaanData?.divisi} - {item.judul_temuan}
                                        </h3>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getStatusColor(item.status_temuan)}`}>
                                            {item.status_temuan}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-3">{item.kondisi_sebenarnya}</p>

                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <div className="flex gap-2 flex-wrap items-center">
                                            <span className={`text-xs px-2 py-1 rounded ${getKeparahanColor(item.tingkat_keparahan)}`}>
                                                {item.tingkat_keparahan}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(item.tanggal_temuan).toLocaleDateString("id-ID")}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setShowDetailModal(true);
                                                }}
                                                className="flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-xs font-medium whitespace-nowrap"
                                            >
                                                <Eye size={12} />
                                                Detail
                                            </button>
                                            {item.status_temuan === "Menunggu Verifikasi" && (
                                                <button
                                                    onClick={() => handleVerifikasiClick(item)}
                                                    disabled={verifikasiLoading}
                                                    className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                >
                                                    {verifikasiLoading ? "Memuat..." : "Verifikasi"}
                                                </button>
                                            )}
                                            {item.verifikasi?.status_verifikasi === "Diterima" && (


                                                <div className="flex justify-between items-center">
                                                    <button
                                                        className="flex items-center gap-1 px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-xs font-medium whitespace-nowrap"
                                                        onClick={() => {
                                                            setSelectedTemuanForVerifikasi(item);
                                                            setVerifikasiReason(item.verifikasi?.catatan || "");
                                                            setShowVerifikasiModal(true);
                                                        }}

                                                        disabled={verifikasiLoading}
                                                    >
                                                        <Pencil size={12} />
                                                        Update
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {item.verifikasi && item.verifikasi.catatan && (
                                        <div className="bg-green-50 border border-green-200 rounded p-3 ">
                                            <div className="text-xs text-green-700 leading-relaxed">
                                                <span className="font-medium">Catatan Verifikasi:</span>
                                                <p className="text-green-700">{item.verifikasi?.catatan}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {filterStatus === "all" && pagination && pagination.last_page > 1 && !loading && (
                    <div className="mt-6 flex flex-col items-center gap-2">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
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
                                                    onClick={() => setCurrentPage(i)}
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
                                                    onClick={() => setCurrentPage(totalPages)}
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
                                        onClick={() => currentPage < pagination.last_page && setCurrentPage(currentPage + 1)}
                                        className={currentPage >= pagination.last_page ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
                {filterStatus !== "all" && !loading && (
                    <div className="mt-6 flex flex-col items-center gap-2">
                    </div>
                )}


                <ModalDetailTemuan
                    isOpen={showDetailModal}
                    onOpenChange={setShowDetailModal}
                    temuan={selectedItem}
                    getSeverityColor={getKeparahanColor}
                    getStatusColor={getStatusColor}
                />

                <ModalCreateTemuan
                    isOpen={showCreateModal}
                    onOpenChange={setShowCreateModal}
                    formData={formData}
                    onFormChange={handleFormChange}
                    auditees={auditees}
                    permintaanDataList={permintaanDataList}
                    onSubmit={handleCreateTemuan}
                    isLoading={createLoading}
                />

                <ModalVerifikasiTemuan
                    isOpen={showVerifikasiModal}
                    onOpenChange={setShowVerifikasiModal}
                    selectedTemuan={selectedTemuanForVerifikasi}
                    tindakLanjutData={tindakLanjutData}
                    verifikasiReason={verifikasiReason}
                    onVerifikasiReasonChange={setVerifikasiReason}
                    onVerifikasiTerima={() => handleVerifikasi("Diterima")}
                    onVerifikasiTolak={() => handleVerifikasi("Ditolak")}
                    onUpdate={handleDoUpdate}  // tambah ini
                    isLoading={verifikasiLoading}
                />
            </div>
        </AuditorLayout >
    );
}

export default AuditorTemuan;
