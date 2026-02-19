import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { PermintaanDataItem } from "@/services/permintaanDataService";

interface ModalDetailPermintaanProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    permintaan: PermintaanDataItem | null;
}

const ModalDetailPermintaan = ({
    isOpen,
    onOpenChange,
    permintaan,
}: ModalDetailPermintaanProps) => {
    if (!permintaan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-2xl">
                <DialogHeader>
                    <DialogTitle>Detail Permintaan : {permintaan.judul_permintaan}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3">Informasi Permintaan</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Divisi</p>
                                <p className="font-medium">{permintaan.divisi || "-"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Status</p>
                                <p className="font-medium">{permintaan.status_permintaan}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3">Deskripsi</h3>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">
                            {permintaan.deskripsi || "-"}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3">Auditee yang Ditugaskan</h3>
                        {permintaan.auditee ? (
                            <div className="bg-blue-50 rounded p-3">
                                <p className="text-sm"><span className="text-gray-600">Nama  :</span> {permintaan.auditee.name}</p>
                                <p className="text-sm"><span className="text-gray-600">Email            :</span> {permintaan.auditee.email}</p>
                                <p className="text-sm">
                                    <span className="text-gray-600">Role  : </span>
                                    <span>
                                        {permintaan.auditee.level_role}
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-500">-</p>
                        )}
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3">Jadwal Audit Terkait</h3>
                        {permintaan.jadwal_audits && permintaan.jadwal_audits.length > 0 ? (
                            <div className="space-y-2">
                                {permintaan.jadwal_audits.map((jadwal, idx) => (
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
            </DialogContent>
        </Dialog>
    );
};

export default ModalDetailPermintaan;
