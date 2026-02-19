import { useEffect, useState } from "react";
import DireksiLayout from "@/components/Layout/Direksi/Layout";
import temuanDataService from "../../services/temuanService"
import type { TemuanItem, TemuanPaginationInfo } from "../../services/temuanService";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
        const debounceTimer = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(searchQuery);
            } else {
                setCurrentPage(1);
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
            const result = await temuanDataService.searchByJudul(query);
            setTemuanData(result);
        } catch (err: any) {
            setError(err.response?.data?.message || "Gagal mencari data");
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
                return "bg-purple-100 text-purple-800";
            case "menunggu verifikasi":
                return "bg-blue-100 text-blue-800";
            case "selesai":
                return "bg-green-100 text-green-800";
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-64 rounded-lg" />
                    ))}
                </div>
            ) : temuanData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">Tidak ada data temuan</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                    {temuanData.map((temuan) => (
                        <div
                            key={temuan.id_temuan}
                            className="bg-white rounded-lg shadow-sm border border-blue-500 p-6   transition-shadow cursor-pointer"
                            onClick={() => {
                                setSelectedTemuan(temuan);
                                setShowModal(true);
                            }}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                        {temuan.judul_temuan}
                                    </h3>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                {temuan.kondisi_sebenarnya}
                            </p>

                            <div className="flex gap-2 flex-wrap mb-4">
                                <Badge className={`${getSeverityColor(temuan.tingkat_keparahan)} pointer-events-none`}>
                                    {temuan.tingkat_keparahan}
                                </Badge>
                                <Badge className={`${getStatusColor(temuan.status_temuan)} pointer-events-none`}>
                                    {temuan.status_temuan}
                                </Badge>
                            </div>

                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>
                                    {new Date(temuan.tanggal_temuan).toLocaleDateString("id-ID")}
                                </span>
                                <div className="flex gap-2">
                                    {/* <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadPdf(temuan.id_temuan);
                                        }}
                                        title="Download PDF"
                                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-medium"
                                    >
                                        <Download size={14} />
                                        Download
                                    </button> */}
                                    <button
                                        onClick={() => {
                                            setSelectedTemuan(temuan);
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
                    ))}
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
                getSeverityColor={getSeverityColor}
                getStatusColor={getStatusColor}
            />
        </DireksiLayout>
    );
};

export default DireksiTemuanData;
