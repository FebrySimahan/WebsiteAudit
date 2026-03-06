import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { TextareaField } from "@/components/ui/FormFields";
import type { TemuanItem } from "@/services/temuanService";

interface ModalVerifikasiTemuanProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedTemuan: TemuanItem | null;
    tindakLanjutData: any;
    verifikasiReason: string;
    onVerifikasiReasonChange: (value: string) => void;
    onVerifikasiTerima: () => void;
    onVerifikasiTolak: () => void;
    onUpdate: () => void;
    isLoading: boolean;
}

const ModalVerifikasiTemuan = ({
    isOpen,
    onOpenChange,
    selectedTemuan,
    tindakLanjutData,
    verifikasiReason,
    onVerifikasiReasonChange,
    onVerifikasiTerima,
    onVerifikasiTolak,
    onUpdate,
    isLoading,
}: ModalVerifikasiTemuanProps) => {
    if (!selectedTemuan) return null;

    const isSelesai = selectedTemuan.status_temuan === "Selesai";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Verifikasi Tindak Lanjut</DialogTitle>
                    <DialogDescription>
                        Verifikasi tindak lanjut yang telah dilakukan oleh auditee.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <h3><strong>Temuan</strong></h3>
                        <p className="text-sm">{selectedTemuan.judul_temuan}</p>
                    </div>

                    {tindakLanjutData && (
                        <div className="bg-green-50 border border-green-200 rounded p-4">
                            <h3 className="font-semibold text-green-900 mb-2">Tindak Lanjut yang Diajukan</h3>
                            <div className="text-sm text-green-800 space-y-2">
                                <p>
                                    <span className="font-medium">Deskripsi:</span> {tindakLanjutData.deskripsi_tindak_lanjut}
                                </p>
                                <p>
                                    <span className="font-medium">Deskripsi Komitmen:</span> {tindakLanjutData.deskripsi_komitmen}
                                </p>
                            </div>
                        </div>
                    )}

                    <TextareaField
                        label="Catatan"
                        value={verifikasiReason}
                        onChange={onVerifikasiReasonChange}
                        rows={4}
                    />

                    <div className="flex gap-3">
                        {isSelesai ? (
                            <button
                                onClick={onUpdate}
                                disabled={isLoading || !verifikasiReason.trim()}
                                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded transition disabled:opacity-50"
                            >
                                {isLoading ? "Memproses..." : "Update"}
                            </button>
                        ) : (

                            <>
                                <button
                                    onClick={onVerifikasiTerima}
                                    disabled={isLoading || !verifikasiReason.trim()}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded transition disabled:opacity-50"
                                >
                                    {isLoading ? "Memproses..." : "Terima"}
                                </button>
                                <button
                                    onClick={onVerifikasiTolak}
                                    disabled={isLoading || !verifikasiReason.trim()}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded transition disabled:opacity-50"
                                >
                                    {isLoading ? "Memproses..." : "Tolak"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ModalVerifikasiTemuan;
