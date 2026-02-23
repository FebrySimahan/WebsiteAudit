import { useEffect, useState } from "react";
import AuditorLayout from "@/components/Layout/Auditor/AuditorLayout";
import permintaanDataService from "@/services/permintaanDataService";
import pdfService from "@/services/pdfService";
import type { PermintaanDataItem, PaginationInfo } from "@/services/permintaanDataService";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Download } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import SuratTugasPemeriksaanService from "@/services/suratTugasPemeriksaanService";

const AuditorPermintaanData = () => {
    const [permintaanData, setPermintaanData] = useState<PermintaanDataItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "Aktif" | "Berjalan" | "Selesai">("all");
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 5;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [selectedItem, setSelectedItem] = useState<PermintaanDataItem | null>(null);
    const [selectedJadwalIds, setSelectedJadwalIds] = useState<number[]>([]);
    const [createLoading, setCreateLoading] = useState(false);
    const [formData, setFormData] = useState({
        id_surat: "",
        id_auditee: "",
        judul_permintaan: "",
        deskripsi: "",
        divisi: "Operasional",
        jenis_permintaan: "Rutin",
        jadwal_audit: [""],
    });

    const [auditees, setAuditees] = useState<any[]>([]);
    const [suratTugas, setSuratTugas] = useState<any[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const fetchPermintaanData = async () => {
        try {
            setLoading(true);
            setError("");

            if (filterStatus === "all") {
                const result = await permintaanDataService.getAllByAuditorPaginated(currentPage, perPage);
                setPermintaanData(result.data);
                setPagination(result.pagination);
            } else {
                const result = await permintaanDataService.filterByStatusAuditor(filterStatus, currentPage, perPage);
                setPermintaanData(result.data);
                setPagination(result.pagination);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal memuat data");
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSetSelesai = async (id_permintaan: number) => {
        try {
            await permintaanDataService.setSelesai(id_permintaan);
            fetchPermintaanData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal menyelesaikan permintaan");
        }
    };

    const handleSearch = async (query: string) => {
        try {
            setLoading(true);
            setError("");
            const result = await permintaanDataService.searchByJudulAuditor(query);
            setPermintaanData(result);
            setPagination(null);
            setCurrentPage(1);
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal mencari data");
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermintaanData();
    }, [filterStatus, currentPage]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(searchQuery);
            } else {
                setCurrentPage(1);
                fetchPermintaanData();
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const loadOptionsForModal = async () => {
        try {
            setLoadingOptions(true);
            const [auditeesList, suratTugasList] = await Promise.all([
                permintaanDataService.getAuditees(),
                SuratTugasPemeriksaanService.getAllForTemuanPage(),
            ]);
            setAuditees(auditeesList);
            setSuratTugas(suratTugasList);
        } catch (err: any) {
            console.error("Error:", err);
            setError("Gagal memuat data pilihan");
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleCreateClick = async () => {
        await loadOptionsForModal();
        setShowCreateModal(true);
    };

    const handleCreatePermintaanData = async () => {
        try {
            setCreateLoading(true);
            await permintaanDataService.createPermintaanData({
                id_surat: parseInt(formData.id_surat),
                id_auditee: parseInt(formData.id_auditee),
                judul_permintaan: formData.judul_permintaan,
                deskripsi: formData.deskripsi,
                divisi: formData.divisi,
                jenis_permintaan: formData.jenis_permintaan,
                jadwal_audit: formData.jadwal_audit.filter(date => date.trim() !== ""),
            });

            setShowCreateModal(false);
            setFormData({
                id_surat: "",
                id_auditee: "",
                judul_permintaan: "",
                deskripsi: "",
                divisi: "Operasional",
                jenis_permintaan: "Rutin",
                jadwal_audit: [""],
            });
            fetchPermintaanData();
            setError("");
        } catch (err: any) {
            console.error("Error:", err);
            setError(err.response?.data?.message || "Gagal membuat permintaan data");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleShowDetail = (item: PermintaanDataItem) => {
        setSelectedItem(item);
        setShowDetailModal(true);
    };

    const handlePrintClick = () => {
        if (selectedItem?.jadwal_audits) {
            setSelectedJadwalIds(selectedItem.jadwal_audits.map(j => j.id_jadwal));
        }
        setShowDetailModal(false);
        setShowPrintModal(true);
    };

    const handleGeneratePdf = async () => {
        if (!selectedItem) return;
        try {
            const blob = await pdfService.getPermintaanDataAuditorPdf(selectedItem.id_permintaan, selectedJadwalIds);
            setPdfBlob(blob);
            setShowPrintModal(false);
            setShowPdfPreview(true);
        } catch (err: any) {
            console.error("Gagal preview PDF:", err);
            setError("Gagal preview PDF");
        }
    };

    const toggleJadwalSelection = (id: number) => {
        setSelectedJadwalIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };



    const getStatusColor = (status: string) => {
        switch (status) {
            case "Aktif":
                return "bg-blue-100 text-blue-800";
            case "Berjalan":
                return "bg-yellow-100 text-yellow-800";
            case "Selesai":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading && permintaanData.length === 0) {
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold">Permintaan Data</h1>
                    <Button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                        + Buat Permintaan Data
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
                        placeholder="Cari berdasarkan judul permintaan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="flex gap-3 mb-6 flex-wrap">
                    {[
                        { value: "all" as const, label: "Semua", activeBg: "bg-blue-600", inactiveBg: "bg-gray-200" },
                        { value: "Aktif" as const, label: "Aktif", activeBg: "bg-green-600", inactiveBg: "bg-gray-200" },
                        { value: "Berjalan" as const, label: "Berjalan", activeBg: "bg-yellow-600", inactiveBg: "bg-gray-200" },
                        { value: "Selesai" as const, label: "Selesai", activeBg: "bg-purple-600", inactiveBg: "bg-gray-200" },
                    ].map(({ value, label, activeBg, inactiveBg }) => (
                        <button
                            key={value}
                            onClick={() => {
                                setCurrentPage(1);
                                setFilterStatus(value);
                            }}
                            className={`px-6 py-2 rounded-lg font-semibold transition ${filterStatus === value
                                ? `${activeBg} text-white shadow-md`
                                : `${inactiveBg} text-gray-700 hover:bg-gray-300`
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>


                <div className="space-y-3">
                    {permintaanData.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Tidak ada permintaan data
                        </div>
                    ) : (
                        permintaanData.map((item) => (
                            <div
                                key={item.id_permintaan}
                                className="border rounded-lg p-4 hover:bg-gray-50 transition bg-white border-blue-500"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg break-words text-gray-800">{item.judul_permintaan}</h3>
                                        <p className="text-sm text-gray-600 mt-1 break-words">{item.deskripsi}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${getStatusColor(item.status_permintaan)}`}>
                                        {item.status_permintaan}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                                        {item.divisi || "-"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 gap-2">
                                    <div className="flex items-center gap-2">
                                        <p>Auditee :</p>
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                            {item.auditee?.name || "-"}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSetSelesai(item.id_permintaan)}
                                            disabled={item.status_permintaan === "Aktif" || item.status_permintaan === "Selesai"}
                                            className={`flex items-center gap-1 px-3 py-2 rounded transition text-xs font-medium ${item.status_permintaan === "Selesai" || item.status_permintaan === "Aktif"
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-green-600 text-white hover:bg-green-700"
                                                }`}
                                        >
                                            Selesaikan
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedItem(item);
                                                if (item.jadwal_audits) {
                                                    setSelectedJadwalIds(item.jadwal_audits.map(j => j.id_jadwal));
                                                }
                                                setShowPrintModal(true);
                                            }}
                                            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-medium"
                                        >
                                            <Download size={16} />
                                            Download
                                        </button>
                                        <button
                                            onClick={() => handleShowDetail(item)}
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


                {pagination && pagination.last_page > 1 && !loading && (
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
            </div>

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Buat Permintaan Data Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Surat Tugas</label>
                            <Select
                                value={formData.id_surat}
                                onValueChange={(value) => setFormData({ ...formData, id_surat: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih surat tugas" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suratTugas.map((st) => (
                                        <SelectItem key={st.id_surat} value={String(st.id_surat)}>
                                            {st.unit_kerja} - {st.tujuan_audit}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Auditee</label>
                            <Select
                                value={formData.id_auditee}
                                onValueChange={(value) => setFormData({ ...formData, id_auditee: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih auditee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {auditees.map((a) => (
                                        <SelectItem key={a.id} value={String(a.id)}>
                                            <p>{a.name} - ({a.level_role})</p>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Judul Permintaan</label>
                            <Input
                                value={formData.judul_permintaan}
                                onChange={(e) => setFormData({ ...formData, judul_permintaan: e.target.value })}
                                placeholder="Masukkan judul"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Deskripsi</label>
                            <textarea
                                value={formData.deskripsi}
                                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                placeholder="Masukkan deskripsi"
                                className="w-full border rounded-md p-2"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Divisi</label>
                            <Select
                                value={formData.divisi}
                                onValueChange={(value) => setFormData({ ...formData, divisi: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Operasional">Operasional</SelectItem>
                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Jenis Permintaan</label>
                            <Select
                                value={formData.jenis_permintaan}
                                onValueChange={(value) => setFormData({ ...formData, jenis_permintaan: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Rutin">Rutin</SelectItem>
                                    <SelectItem value="Sekali">Sekali</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium">Jadwal Audit</label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setFormData({
                                        ...formData,
                                        jadwal_audit: [...formData.jadwal_audit, ""]
                                    })}
                                    className="h-7 text-xs"
                                >
                                    + Tambah Tanggal
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {formData.jadwal_audit.map((date, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => {
                                                const newJadwal = [...formData.jadwal_audit];
                                                newJadwal[index] = e.target.value;
                                                setFormData({ ...formData, jadwal_audit: newJadwal });
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                                const newJadwal = formData.jadwal_audit.filter((_, i) => i !== index);
                                                setFormData({ ...formData, jadwal_audit: newJadwal.length > 0 ? newJadwal : [""] });
                                            }}
                                            className="h-10 w-10 p-0"
                                        >
                                            X
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleCreatePermintaanData}
                                disabled={createLoading || loadingOptions}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {createLoading ? "Membuat..." : "Buat"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detail Permintaan Data</DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Judul</p>
                                <p className="font-semibold">{selectedItem.judul_permintaan}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Deskripsi</p>
                                <p className="text-sm">{selectedItem.deskripsi}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Divisi</p>
                                    <p className="font-semibold">{selectedItem.divisi}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Jenis</p>
                                    <p className="font-semibold">{selectedItem.jenis_permintaan}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <span className={`text-xs px-2 py-1 rounded inline-block ${getStatusColor(selectedItem.status_permintaan)}`}>
                                    {selectedItem.status_permintaan}
                                </span>
                            </div>
                            {selectedItem.auditee && (
                                <div>
                                    <p className="text-sm text-gray-600">Auditee</p>
                                    <p className="font-semibold">{selectedItem.auditee.name}</p>
                                </div>
                            )}
                            {selectedItem.jadwal_audits && selectedItem.jadwal_audits.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Jadwal Audit</p>
                                    <div className="space-y-1">
                                        {selectedItem.jadwal_audits.map((jadwal) => (
                                            <p key={jadwal.id_jadwal} className="text-sm">
                                                {new Date(jadwal.tanggal_audit).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2 justify-end pt-4 border-t">
                                <Button
                                    onClick={handlePrintClick}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Print
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDetailModal(false)}
                                >
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={showPrintModal} onOpenChange={setShowPrintModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Pilih Tanggal Audit untuk Print</DialogTitle>
                    </DialogHeader>
                    {selectedItem && selectedItem.jadwal_audits && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">Pilih tanggal yang ingin disertakan dalam PDF:</p>
                            <div className="space-y-2 border rounded-lg p-3 max-h-48 overflow-y-auto">
                                {selectedItem.jadwal_audits.map((jadwal) => (
                                    <label key={jadwal.id_jadwal} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedJadwalIds.includes(jadwal.id_jadwal)}
                                            onChange={() => toggleJadwalSelection(jadwal.id_jadwal)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">
                                            {new Date(jadwal.tanggal_audit).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex gap-2 justify-end pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPrintModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleGeneratePdf}
                                    disabled={selectedJadwalIds.length === 0}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Preview PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>


            <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Preview PDF Permintaan Data</DialogTitle>
                    </DialogHeader>
                    {pdfBlob && (
                        <>
                            <div className="w-full h-[70vh] border rounded-lg">
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
                                        const url = URL.createObjectURL(pdfBlob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `permintaan-${selectedItem?.id_permintaan}.pdf`;
                                        a.click();
                                        URL.revokeObjectURL(url);
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
        </AuditorLayout>
    );
};

export default AuditorPermintaanData;