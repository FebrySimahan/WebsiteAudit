import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { TextareaField, DisplayField } from "@/components/ui/FormFields";
import type { TemuanItem } from "@/services/temuanService";

interface ModalTindakLanjutProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedTemuan: TemuanItem | null;
    deskripsiTindakLanjut: string;
    onDeskripsiChange: (value: string) => void;
    deskripsiKomitmen: string;
    onDeskripsiKomitmenChange: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    hasRejectedVerifikasi: boolean;
    rejectionNote?: string;
}

const ModalTindakLanjut = ({
    isOpen,
    onOpenChange,
    selectedTemuan,
    deskripsiTindakLanjut,
    onDeskripsiChange,
    deskripsiKomitmen,
    onDeskripsiKomitmenChange,
    onSubmit,
    isLoading,
    hasRejectedVerifikasi,
    rejectionNote,
}: ModalTindakLanjutProps) => {
    if (!selectedTemuan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {hasRejectedVerifikasi ? "Tindaklanjuti Lagi" : "Buat Tindak Lanjut"}
                    </DialogTitle>
                    <DialogDescription>
                        Buat rencana tindak lanjut untuk mengatasi temuan ini.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <DisplayField
                        label="Judul Temuan"
                        value={selectedTemuan.judul_temuan}
                    />

                    {hasRejectedVerifikasi && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-xs font-semibold text-red-800 mb-1">Catatan Penolakan:</p>
                            <p className="text-sm text-red-700">{rejectionNote}</p>
                        </div>
                    )}

                    <TextareaField
                        label="Deskripsi Tindak Lanjut"
                        value={deskripsiTindakLanjut}
                        onChange={onDeskripsiChange}
                        placeholder="Masukkan deskripsi tindak lanjut yang akan dilakukan..."
                        rows={4}
                    />

                    <TextareaField
                        label="Deskripsi Komitmen"
                        value={deskripsiKomitmen}
                        onChange={onDeskripsiKomitmenChange}
                        placeholder="Masukkan deskripsi komitmen tindak lanjut..."
                        rows={2}
                    />

                    <button
                        onClick={onSubmit}
                        disabled={isLoading || !deskripsiTindakLanjut.trim() || !deskripsiKomitmen.trim()}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {isLoading ? "Menyimpan..." : "Simpan Tindak Lanjut"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ModalTindakLanjut;
