import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { TextareaField, DisplayField } from "@/components/ui/FormFields";
import type { Temuan } from "@/services/temuanService";

interface ModalResponTemuanProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedTemuan: Temuan | null;
    alasanPenolakan: string;
    onAlasanPenolakanChange: (value: string) => void;
    onResponDiterima: () => void;
    onResponDitolak: () => void;
    isLoading: boolean;
}

const ModalResponTemuan = ({
    isOpen,
    onOpenChange,
    selectedTemuan,
    alasanPenolakan,
    onAlasanPenolakanChange,
    onResponDiterima,
    onResponDitolak,
    isLoading,
}: ModalResponTemuanProps) => {
    if (!selectedTemuan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Tanggapi Temuan</DialogTitle>
                    <DialogDescription>
                        Terima atau tolak temuan yang telah diberikan oleh auditor.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <DisplayField
                        label="Judul Temuan"
                        value={selectedTemuan.judul_temuan}
                    />

                    {selectedTemuan.status_temuan === "Terbuka" && (!selectedTemuan.responTemuans || selectedTemuan.responTemuans.length === 0) && (
                        <div className="space-y-3">
                            <button
                                onClick={onResponDiterima}
                                disabled={isLoading}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {isLoading ? "Memproses..." : "Terima Temuan"}
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-300"></span>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">atau</span>
                                </div>
                            </div>

                            <TextareaField
                                label="Alasan Penolakan (opsional)"
                                value={alasanPenolakan}
                                onChange={onAlasanPenolakanChange}
                                placeholder="Masukkan alasan penolakan..."
                                rows={3}
                            />

                            <button
                                onClick={onResponDitolak}
                                disabled={isLoading || !alasanPenolakan.trim()}
                                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {isLoading ? "Memproses..." : "Tolak Temuan"}
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ModalResponTemuan;
