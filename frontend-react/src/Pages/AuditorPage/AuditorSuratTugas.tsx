import { useEffect, useState } from "react";
import AuditorLayout from "@/components/Layout/Auditor/AuditorLayout";
import SuratTugasPemeriksaanService from "@/services/suratTugasPemeriksaanService";
import type { SuratTugasPemeriksaanItem, SuratTugasPaginationInfo } from "@/services/suratTugasPemeriksaanService";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";

const AuditorSuratTugas = () => {
    const [suratTugas, setSuratTugas] = useState<SuratTugasPemeriksaanItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [userId, setUserId] = useState<number | null>(null);
    const [pagination, setPagination] = useState<SuratTugasPaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 5;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [selectedItem, setSelectedItem] = useState<SuratTugasPemeriksaanItem | null>(null);
    const [createLoading, setCreateLoading] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [formData, setFormData] = useState({
        unit_kerja: "",
        tujuan_audit: "",
        deskripsi_permintaan: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
    });

    const formatSuratNumber = (id: number): string => {
        const currentYear = new Date().getFullYear();
        const paddedId = String(id).padStart(3, "0");
        return `${paddedId}/AI/DIR-MSA/X/${currentYear}`;
    };

    const handlePrintPDF = async () => {
        if (!selectedItem) return;
        try {
            setPdfLoading(true);
            const blob = await SuratTugasPemeriksaanService.getPreviewPDF(selectedItem.id_surat);
            setPdfBlob(blob);
            setShowDetailModal(false);
            setShowPdfPreview(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal memuat PDF");
        } finally {
            setPdfLoading(false);
        }
    };

    useEffect(() => {
        const userStr = sessionStorage.getItem("cached_user");
        if (userStr) {
            const userData = JSON.parse(userStr);
            setUserId(userData.data?.id);
        }
        fetchSuratTugas();
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(searchQuery);
            } else {
                fetchSuratTugas();
            }
        }, 500);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, currentPage]);

    const fetchSuratTugas = async () => {
        try {
            setLoading(true);
            setError("");
            const result = await SuratTugasPemeriksaanService.getAllPaginated(currentPage, perPage);
            setSuratTugas(result.data);
            setPagination(result.pagination);
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal memuat surat tugas");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        try {
            setLoading(true);
            setError("");
            const data = await SuratTugasPemeriksaanService.searchByUnitKerja(query);
            setSuratTugas(data);
            setPagination(null);
            setCurrentPage(1);
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal mencari surat tugas");
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSuratTugas = async () => {
        if (!userId || !formData.unit_kerja.trim() || !formData.tujuan_audit.trim() ||
            !formData.tanggal_mulai || !formData.tanggal_selesai) {
            setError("Semua field harus diisi");
            return;
        }

        try {
            setCreateLoading(true);
            await SuratTugasPemeriksaanService.create({
                id_auditor: userId,
                unit_kerja: formData.unit_kerja,
                tujuan_audit: formData.tujuan_audit,
                deskripsi_permintaan: formData.deskripsi_permintaan || undefined,
                tanggal_mulai: formData.tanggal_mulai,
                tanggal_selesai: formData.tanggal_selesai,
            });

            setFormData({
                unit_kerja: "",
                tujuan_audit: "",
                deskripsi_permintaan: "",
                tanggal_mulai: "",
                tanggal_selesai: "",
            });
            setShowCreateModal(false);
            await fetchSuratTugas();
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal membuat surat tugas");
            console.error("Error:", err);
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <AuditorLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Surat Tugas Pemeriksaan
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Buat Surat Tugas
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div>
                    <input
                        type="text"
                        placeholder="Cari berdasarkan unit kerja..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-40 rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {suratTugas.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-lg">Tidak ada surat tugas</p>
                            </div>
                        ) : (
                            suratTugas.map((item) => (
                                <div
                                    key={item.id_surat}
                                    className="bg-white rounded-lg p-5 border border-blue-500"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                {item.unit_kerja}
                                            </h3>
                                            <p className="text-sm font-mono text-blue-600 font-semibold">
                                                {formatSuratNumber(item.id_surat)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex gap-4">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Tanggal Mulai:</span> {new Date(item.tanggal_mulai).toLocaleDateString("id-ID")}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Tanggal Selesai:</span> {new Date(item.tanggal_selesai).toLocaleDateString("id-ID")}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setShowDetailModal(true);
                                                }}
                                                className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-xs font-medium"
                                            >
                                                <Eye size={14} />
                                                Detail
                                            </button>
                                        </div>
                                    </div>


                                </div>
                            ))
                        )}
                    </div>
                )}


                {pagination && pagination.last_page > 1 && (
                    <div className="flex flex-col items-center gap-4 mt-6">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => {
                                    if (
                                        page === 1 ||
                                        page === pagination.last_page ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    onClick={() => setCurrentPage(page)}
                                                    isActive={currentPage === page}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return (
                                            <PaginationItem key={page}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }
                                    return null;
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))}
                                        className={currentPage === pagination.last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>

                    </div>
                )}

                {showCreateModal && (
                    <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Buat Surat Tugas Pemeriksaan</DialogTitle>
                                <DialogDescription>
                                    Isi form berikut untuk membuat surat tugas baru
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                        Unit Kerja
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.unit_kerja}
                                        onChange={(e) => setFormData({ ...formData, unit_kerja: e.target.value })}
                                        placeholder="Masukkan unit kerja..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                        Tujuan Audit
                                    </label>
                                    <textarea
                                        value={formData.tujuan_audit}
                                        onChange={(e) => setFormData({ ...formData, tujuan_audit: e.target.value })}
                                        placeholder="Masukkan tujuan audit..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                        Deskripsi Permintaan
                                    </label>
                                    <textarea
                                        value={formData.deskripsi_permintaan}
                                        onChange={(e) => setFormData({ ...formData, deskripsi_permintaan: e.target.value })}
                                        placeholder="Tulis detail permintaan audit Anda di sini..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.tanggal_mulai}
                                        onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                        Tanggal Selesai
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.tanggal_selesai}
                                        onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    onClick={handleCreateSuratTugas}
                                    disabled={createLoading}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {createLoading ? "Menyimpan..." : "Simpan Surat Tugas"}
                                </button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}


                {showDetailModal && selectedItem && (
                    <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Detail Surat Tugas Pemeriksaan</DialogTitle>
                                <DialogDescription>
                                    Informasi lengkap surat tugas pemeriksaan
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <p className="text-sm text-gray-600 mb-1">Nomor Surat Tugas</p>
                                    <p className="text-2xl font-mono font-bold text-blue-600">
                                        {formatSuratNumber(selectedItem.id_surat)}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-600 mb-1">Unit Kerja</p>
                                        <p className="text-base text-gray-800">{selectedItem.unit_kerja}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-600 mb-1">ID Surat</p>
                                        <p className="text-base text-gray-800">#{selectedItem.id_surat}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-2">Tujuan Audit</p>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-base text-gray-800 whitespace-pre-wrap">
                                            {selectedItem.tujuan_audit}
                                        </p>
                                    </div>
                                </div>

                                {selectedItem.deskripsi_permintaan && (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-600 mb-2">Deskripsi Permintaan</p>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-base text-gray-800 whitespace-pre-wrap">
                                                {selectedItem.deskripsi_permintaan}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-600 mb-1">Tanggal Mulai</p>
                                        <p className="text-base text-gray-800">
                                            {new Date(selectedItem.tanggal_mulai).toLocaleDateString("id-ID", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-600 mb-1">Tanggal Selesai</p>
                                        <p className="text-base text-gray-800">
                                            {new Date(selectedItem.tanggal_selesai).toLocaleDateString("id-ID", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        onClick={handlePrintPDF}
                                        disabled={pdfLoading}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        {pdfLoading ? "Menyiapkan PDF..." : "Preview PDF"}
                                    </button>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}


                <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Preview PDF Surat Tugas</DialogTitle>
                            <DialogDescription>
                                Preview surat tugas pemeriksaan sebelum mengunduh
                            </DialogDescription>
                        </DialogHeader>
                        {pdfBlob && (
                            <>
                                <div className="w-full h-[60vh] border rounded-lg">
                                    <iframe
                                        src={URL.createObjectURL(pdfBlob)}
                                        className="w-full h-full"
                                        title="PDF Preview"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPdfPreview(false)}
                                    >
                                        Tutup
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (pdfBlob && selectedItem) {
                                                const url = URL.createObjectURL(pdfBlob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `SuratTugas_${String(selectedItem.id_surat).padStart(3, "0")}_${new Date().getFullYear()}.pdf`;
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            }
                                        }}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Download PDF
                                    </Button>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AuditorLayout>
    );
};

export default AuditorSuratTugas;
