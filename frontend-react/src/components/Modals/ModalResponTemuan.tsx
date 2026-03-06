import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DisplayField } from "@/components/ui/FormFields";
import type { TemuanItem } from "@/services/temuanService";

interface ModalResponTemuanProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedTemuan: TemuanItem | null;
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
    onResponDiterima,
    isLoading,
}: ModalResponTemuanProps) => {
    if (!selectedTemuan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Tanggapi Temuan</DialogTitle>
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
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ModalResponTemuan;
