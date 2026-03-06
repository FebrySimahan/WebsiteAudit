import { useEffect, useState } from "react";
import AuditeeLayout from "@/components/Layout/Auditee/AuditeeLayout";
import permintaanDataService from "@/services/permintaanDataService";
import pdfService from "@/services/pdfService";
import type { PermintaanDataItem, PaginationInfo } from "@/services/permintaanDataService";
import { Eye, Download, X, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";

const AuditeeIkhtisarTemuan = () => {
    const [data, setData] = useState<PermintaanDataItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedItem, setSelectedItem] = useState<PermintaanDataItem | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [showJadwalModal, setShowJadwalModal] = useState(false);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [selectedJadwals, setSelectedJadwals] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 5;
    const [showEditAuditeeModal, setShowEditAuditeeModal] = useState(false);
    const [auditeeList, setAuditeeList] = useState<string[]>([]);
    const [auditeeInput, setAuditeeInput] = useState("");

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.trim()) {
                setCurrentPage(1);
                handleSearch(searchQuery);
            } else if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchData();
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            const result = await permintaanDataService.getAuditeeIkhtisarTemuan(currentPage, perPage);
            setData(result.data);
            setPagination(result.pagination);
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
            const result = await permintaanDataService.getAuditeeIkhtisarTemuan(currentPage, perPage);
            const filtered = result.data.filter(item =>
                item.judul_permintaan.toLowerCase().includes(query.toLowerCase())
            );
            setData(filtered);
            setPagination(result.pagination);
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal mencari data");
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async (id: number) => {
        try {
            if (!id) {
                alert("ID tidak valid");
                return;
            }
            const item = data.find(d => d.id_permintaan === id);
            if (item) {
                setSelectedItem(item);
                setSelectedJadwals([]);
                setShowJadwalModal(true);
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Gagal memuat data");
        }
    };

    const toggleJadwalSelection = (jadwalId: number) => {
        setSelectedJadwals(prev =>
            prev.includes(jadwalId)
                ? prev.filter(id => id !== jadwalId)
                : [...prev, jadwalId]
        );
    };

    const handleDownloadSelectedJadwals = async () => {
        try {
            if (!selectedItem || selectedJadwals.length === 0) {
                alert("Pilih minimal 1 jadwal");
                return;
            }
            const blob = await pdfService.getPermintaanDataAuditeePdf(selectedItem.id_permintaan, selectedJadwals, auditeeList);
            setPdfBlob(blob);
            setShowPdfPreview(true);
            setShowJadwalModal(false);
        } catch (err) {
            console.error("Gagal preview PDF:", err);
            alert("Gagal preview PDF");
        }
    };

    const closePdfPreview = () => {
        setShowPdfPreview(false);
        setPdfBlob(null);
    };

    const handleAddAuditee = () => {
        if (auditeeInput.trim() === "") {
            alert("Nama auditee tidak boleh kosong");
            return;
        }
        setAuditeeList([...auditeeList, auditeeInput]);
        setAuditeeInput("");
    };

    const handleRemoveAuditee = (index: number) => {
        setAuditeeList(auditeeList.filter((_, i) => i !== index));
    };

    return (
        <AuditeeLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Daftar Ikhtisar Temuan
                </h1>
                <input
                    type="text"
                    placeholder="Cari berdasarkan judul ikhtisar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 mb-4"></div>
                        <p className="text-slate-600">Memuat data...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    {data.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            Tidak ada data ikhtisar temuan
                        </div>
                    ) : (
                        data.map((item, index) => (
                            <div
                                key={`permintaan-${item.id_permintaan}-${index}`}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-5 border border-blue-500"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-800 flex-1 pr-2">
                                        {item.judul_permintaan || "Ikhtisar Temuan"}
                                    </h3>
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${item.status_permintaan === "Selesai"
                                            ? "bg-green-100 text-green-800"
                                            : item.status_permintaan === "Berjalan"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`}
                                    >
                                        {item.status_permintaan}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                                        {item.divisi || "-"}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-3">
                                    <strong>Auditor:</strong> {item.auditor?.name || "-"}
                                </p>

                                <div className="flex items-center justify-end pt-3 gap-2">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setShowEditAuditeeModal(true);
                                            }}
                                            title="Edit Auditee Names"
                                            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs font-medium"
                                        >
                                            <Edit size={16} />
                                            Edit Auditee
                                        </button>
                                        <button
                                            onClick={() => handleDownloadPdf(item.id_permintaan)}
                                            title="Download PDF"
                                            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-medium"
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setShowModal(true);
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

            {showModal && selectedItem && (
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Detail Permintaan: {selectedItem.judul_permintaan}</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-3">Informasi Permintaan</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Divisi</p>
                                        <p className="font-medium">{selectedItem.divisi || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Status</p>
                                        <p className="font-medium">{selectedItem.status_permintaan}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-800 mb-3">Deskripsi</h3>
                                <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">
                                    {selectedItem.deskripsi || "-"}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-800 mb-3">Jadwal Audit Terkait</h3>
                                {selectedItem.jadwal_audits && selectedItem.jadwal_audits.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedItem.jadwal_audits.map((jadwal, idx) => (
                                            <div key={idx} className="bg-yellow-50 rounded p-3 border border-yellow-200">
                                                <p className="text-sm"><span className="text-gray-600">Tanggal:</span> {jadwal.tanggal_audit ? new Date(jadwal.tanggal_audit).toLocaleDateString("id-ID") : "-"}</p>
                                                <p className="text-sm"><span className="text-gray-600">Status:</span> {jadwal.status_jadwal}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Tidak ada jadwal terkait</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setShowEditAuditeeModal(true);
                                }}
                                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition font-medium flex items-center gap-2"
                            >
                                <Edit size={16} />
                                Edit Auditee
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    handleDownloadPdf(selectedItem.id_permintaan);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium flex items-center gap-2"
                            >
                                <Download size={16} />
                                Print / PDF
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition font-medium"
                            >
                                Tutup
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Edit Auditee Modal */}
            {showEditAuditeeModal && (
                <Dialog open={showEditAuditeeModal} onOpenChange={setShowEditAuditeeModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Nama Auditee untuk Signature</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Daftar Auditee yang sudah ditambah */}
                            <div className="space-y-2">
                                <p className="font-semibold text-gray-800">Daftar Auditee:</p>
                                {auditeeList.length > 0 ? (
                                    auditeeList.map((name, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-300"
                                        >
                                            <span className="text-gray-700">{idx + 1}. {name}</span>
                                            <button
                                                onClick={() => handleRemoveAuditee(idx)}
                                                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm italic">Belum ada auditee ditambahkan</p>
                                )}
                            </div>

                            {/* Input Nama Auditee Baru */}
                            <div className="border-t pt-4">
                                <p className="font-semibold text-gray-800 mb-2">Tambah Auditee Baru:</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Masukkan nama auditee..."
                                        value={auditeeInput}
                                        onChange={(e) => setAuditeeInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddAuditee();
                                            }
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={handleAddAuditee}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
                                    >
                                        Tambah
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button
                                onClick={() => setShowEditAuditeeModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition font-medium"
                            >
                                Tutup
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {showJadwalModal && selectedItem && (
                <Dialog open={showJadwalModal} onOpenChange={setShowJadwalModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Pilih Jadwal Audit untuk {selectedItem.judul_permintaan}</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {selectedItem.jadwal_audits && selectedItem.jadwal_audits.length > 0 ? (
                                selectedItem.jadwal_audits.map((jadwal, idx) => (
                                    <label
                                        key={idx}
                                        className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer flex items-center gap-3"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedJadwals.includes(jadwal.id_jadwal)}
                                            onChange={() => toggleJadwalSelection(jadwal.id_jadwal)}
                                            className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">
                                                {new Date(jadwal.tanggal_audit).toLocaleDateString("id-ID", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Status: <span className="font-medium">{jadwal.status_jadwal}</span>
                                            </p>
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">Tidak ada jadwal audit tersedia</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button
                                onClick={() => setShowJadwalModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDownloadSelectedJadwals}
                                disabled={selectedJadwals.length === 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Download size={16} />
                                Download ({selectedJadwals.length})
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {showPdfPreview && pdfBlob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col">

                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-bold text-gray-800">Preview PDF</h2>
                            <button
                                onClick={closePdfPreview}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden bg-gray-100">
                            <embed
                                src={URL.createObjectURL(pdfBlob)}
                                type="application/pdf"
                                className="w-full h-full"
                            />
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t">
                            <button
                                onClick={() => {
                                    const url = URL.createObjectURL(pdfBlob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'permintaan.pdf');
                                    document.body.appendChild(link);
                                    link.click();
                                    link?.parentNode?.removeChild(link);
                                    URL.revokeObjectURL(url);
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium flex items-center gap-2"
                            >
                                <Download size={16} />
                                Download
                            </button>
                            <button
                                onClick={closePdfPreview}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition font-medium"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuditeeLayout>
    );
};

export default AuditeeIkhtisarTemuan;
