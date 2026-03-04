import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import type { TemuanItem as TemuanItemBase } from "@/services/temuanService";
import { useEffect, useState } from "react";
import permintaanDataService from "@/services/permintaanDataService";
import type { PermintaanDataItem } from "@/services/permintaanDataService";

type TemuanItem = TemuanItemBase & {
    auditee?: { name?: string } | null;
    id_permintaan?: number | null;
};

interface ModalDetailTemuanProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    temuan: TemuanItem | null;
    getSeverityColor: (tingkat: string) => string;
    getStatusColor: (status: string) => string;
}

const ModalDetailTemuan = ({
    isOpen,
    onOpenChange,
    temuan,
    getSeverityColor,
    getStatusColor,
}: ModalDetailTemuanProps) => {
    const [permintaan, setPermintaan] = useState<PermintaanDataItem | null>(null);

    useEffect(() => {
        if (temuan?.id_permintaan) {
            permintaanDataService.getAll().then((data) => {
                const found = data.find((item) => item.id_permintaan === temuan.id_permintaan);
                setPermintaan(found || null);
            });
        } else {
            setPermintaan(null);
        }
    }, [temuan]);

    if (!temuan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detail Temuan</DialogTitle>
                    <DialogDescription>
                        Informasi lengkap tentang temuan yang diberikan oleh auditor.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {permintaan && (
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Divisi Permintaan:</p>
                            <p className="text-sm text-gray-600">{permintaan.divisi}</p>
                        </div>
                    )}

                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Judul Temuan:</p>
                        <p className="text-sm text-gray-600">{temuan.judul_temuan}</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Status:</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(temuan.status_temuan)}`}>
                                {temuan.status_temuan}
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Keparahan:</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(temuan.tingkat_keparahan)}`}>
                                {temuan.tingkat_keparahan}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Tanggal Temuan:</p>
                        <p className="text-sm text-gray-600">{new Date(temuan.tanggal_temuan).toLocaleDateString("id-ID")}</p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Kondisi Sebenarnya:</p>
                        <p className="text-sm text-gray-600">{temuan.kondisi_sebenarnya || "-"}</p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Keadaan Seharusnya:</p>
                        <p className="text-sm text-gray-600">{temuan.keadaan_seharusnya || "-"}</p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Penyebab:</p>
                        <p className="text-sm text-gray-600">{temuan.penyebab || "-"}</p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Dampak:</p>
                        <p className="text-sm text-gray-600">{temuan.dampak || "-"}</p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Rekomendasi:</p>
                        <p className="text-sm text-gray-600">{temuan.rekomendasi || "-"}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ModalDetailTemuan;
