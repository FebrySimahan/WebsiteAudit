import { useEffect, useState } from "react";
import DireksiLayout from "@/components/Layout/Direksi/Layout";
import temuanDataService from "../../services/temuanService"
import type { TemuanItem, TemuanPaginationInfo } from "../../services/temuanService";
import { Eye } from "lucide-react";
import ModalDetailTemuan from "@/components/Modals/ModalDetailTemuan";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";


const DireksiTemuanData = () => {

    const [temuanData, setTemuanData] = useState<TemuanItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTemuan, setSelectedTemuan] = useState<TemuanItem | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [filterKeparahan, setFilterKeparahan] = useState<"all" | "rendah" | "sedang" | "tinggi">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState<TemuanPaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 5;

    useEffect(() => {
        fetchData();
    }, [filterKeparahan, currentPage]);

    useEffect(() => {
        // Reset search when filter changes
        setSearchQuery("");
    }, [filterKeparahan]);

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

            if (filterKeparahan === "all") {
                const result = await temuanDataService.getAllPaginated(currentPage, perPage);
                setTemuanData(result.data);
                setPagination(result.pagination);
            } else {
                const result = await temuanDataService.filterByKeparahan(
                    filterKeparahan.charAt(0).toUpperCase() + filterKeparahan.slice(1),
                    currentPage,
                    perPage
                );
                setTemuanData(result.data);
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
            const result = await temuanDataService.searchByJudulPaginated(query, currentPage, perPage);
            setTemuanData(result.data);
            setPagination(result.pagination);
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal mencari data");
            console.error("Error:", err);
        } finally {
            setLoading(false);
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



    return (
        <DireksiLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Data Temuan Audit
                </h1>
                <input
                    type="text"
                    placeholder="Cari berdasarkan judul temuan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex gap-3 mb-6 flex-wrap">
                {[
                    { value: "all" as const, label: "Semua", color: "blue" },
                    { value: "rendah" as const, label: "Rendah", color: "blue" },
                    { value: "sedang" as const, label: "Sedang", color: "yellow" },
                    { value: "tinggi" as const, label: "Tinggi", color: "red" },
                ].map(({ value, label, color }) => (
                    <button
                        key={value}
                        onClick={() => {
                            setCurrentPage(1);
                            setFilterKeparahan(value);
                        }}
                        className={`px-6 py-2 rounded-lg font-semibold transition ${filterKeparahan === value
                            ? `bg-${color}-600 text-white shadow-md`
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        {label}
                    </button>
                ))}
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
                <div className="space-y-3">
                    {temuanData.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Tidak ada data temuan
                        </div>
                    ) : (
                        temuanData.map((item, index) => (
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
                                                setSelectedTemuan(item);
                                                setShowModal(true);
                                            }}
                                            className="flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-xs font-medium whitespace-nowrap"
                                        >
                                            <Eye size={12} />
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

            <ModalDetailTemuan
                isOpen={showModal}
                onOpenChange={setShowModal}
                temuan={selectedTemuan}
                getSeverityColor={getKeparahanColor}
                getStatusColor={getStatusColor}
            />
        </DireksiLayout>
    );
};

export default DireksiTemuanData;
