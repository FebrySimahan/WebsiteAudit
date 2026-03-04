import { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { InputField, TextareaField, SelectField, DisplayField } from "@/components/ui/FormFields";

interface TemuanFormData {
    id_permintaan: string;
    tanggal_temuan: string;
    level_role: string;
    judul_temuan: string;
    kondisi_sebenarnya: string;
    keadaan_seharusnya: string;
    penyebab: string;
    dampak: string;
    rekomendasi: string;
    tingkat_keparahan: string;
}

interface ModalCreateTemuanProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    formData: TemuanFormData;
    onFormChange: (field: string, value: string) => void;
    auditees: any[];
    permintaanDataList: any[];
    onSubmit: () => void;
    isLoading: boolean;
}

// Constants
const TINGKAT_KEPARAHAN_OPTIONS = [
    { value: "Rendah", label: "Rendah" },
    { value: "Sedang", label: "Sedang" },
    { value: "Tinggi", label: "Tinggi" },
];

const ModalCreateTemuan = ({
    isOpen,
    onOpenChange,
    formData,
    onFormChange,
    permintaanDataList,
    onSubmit,
    isLoading,
}: ModalCreateTemuanProps) => {
    const [localPermintaanId, setLocalPermintaanId] = useState(formData.id_permintaan);


    const selectedPermintaan = useMemo(
        () => permintaanDataList?.find((p) => p.id_permintaan.toString() === localPermintaanId),
        [permintaanDataList, localPermintaanId]
    );

    const selectedLevelRole =
        selectedPermintaan?.auditee?.level_role ||
        selectedPermintaan?.level_role ||
        selectedPermintaan?.levelrole ||
        "";


    const permintaanOptions = useMemo(
        () => permintaanDataList.map((p) => ({
            value: p.id_permintaan.toString(),
            label: p.judul_permintaan,
        })),
        [permintaanDataList]
    );

    const tanggalOptions = useMemo(() => {
        if (!selectedPermintaan?.jadwal_audits?.length) return [];
        return selectedPermintaan.jadwal_audits.map((jadwal: any) => ({
            value: new Date(jadwal.tanggal_audit).toISOString().split("T")[0],
            label: new Date(jadwal.tanggal_audit).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        }));
    }, [selectedPermintaan]);


    const handlePermintaanChange = (value: string) => {
        setLocalPermintaanId(value);
        onFormChange("id_permintaan", value);

        if (value) {
            const permintaan = permintaanDataList?.find((p) => p.id_permintaan.toString() === value);
            const levelRole =
                permintaan?.auditee?.level_role ||
                permintaan?.level_role ||
                permintaan?.levelrole ||
                "";

            onFormChange("levelrole", levelRole);

            if (permintaan?.auditee) {
                onFormChange("id_auditee", String(permintaan.auditee.id));
            }
        } else {
            onFormChange("id_auditee", "");
            onFormChange("levelrole", "");
        }
        onFormChange("tanggal_temuan", "");
    };

    const updateField = (field: keyof TemuanFormData) => (value: string) => {
        onFormChange(field, value);
    };

    // Validasi form
    const isFormValid =
        formData.id_permintaan &&
        formData.tanggal_temuan &&
        formData.tingkat_keparahan &&
        formData.judul_temuan &&
        formData.kondisi_sebenarnya &&
        formData.keadaan_seharusnya &&
        formData.penyebab &&
        formData.dampak &&
        formData.rekomendasi;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Buat Temuan Baru</DialogTitle>
                    <br />
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {tanggalOptions.length > 0 ? (
                            <SelectField
                                label="Tanggal Temuan"
                                value={formData.tanggal_temuan}
                                onChange={updateField("tanggal_temuan")}
                                options={tanggalOptions}
                                placeholder="Pilih Tanggal Audit"
                            />
                        ) : (
                            <DisplayField
                                label="Tanggal Temuan"
                                value=""
                            />
                        )}

                        <SelectField
                            label="Tingkat Keparahan"
                            value={formData.tingkat_keparahan}
                            onChange={updateField("tingkat_keparahan")}
                            options={TINGKAT_KEPARAHAN_OPTIONS}
                            placeholder="Pilih Keparahan"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <DisplayField
                            label="Auditee"
                            value={selectedLevelRole}
                        />

                        <SelectField
                            label="Permintaan Data"
                            value={localPermintaanId}
                            onChange={handlePermintaanChange}
                            options={permintaanOptions}
                            placeholder="Pilih Permintaan"
                        />
                    </div>

                    <InputField
                        label="Judul Temuan"
                        value={formData.judul_temuan}
                        onChange={updateField("judul_temuan")}
                        placeholder="Masukkan judul temuan"
                    />

                    <TextareaField
                        label="Kondisi Sebenarnya"
                        value={formData.kondisi_sebenarnya}
                        onChange={updateField("kondisi_sebenarnya")}
                        placeholder="Jelaskan kondisi yang sebenarnya terjadi"
                    />

                    <TextareaField
                        label="Keadaan Seharusnya"
                        value={formData.keadaan_seharusnya}
                        onChange={updateField("keadaan_seharusnya")}
                        placeholder="Jelaskan keadaan yang seharusnya"
                    />

                    <TextareaField
                        label="Penyebab"
                        value={formData.penyebab}
                        onChange={updateField("penyebab")}
                        placeholder="Jelaskan penyebab temuan"
                    />

                    <TextareaField
                        label="Dampak"
                        value={formData.dampak}
                        onChange={updateField("dampak")}
                        placeholder="Jelaskan dampak dari temuan"
                    />

                    <TextareaField
                        label="Rekomendasi"
                        value={formData.rekomendasi}
                        onChange={updateField("rekomendasi")}
                        placeholder="Berikan rekomendasi perbaikan"
                    />

                    <button
                        onClick={onSubmit}
                        disabled={isLoading || !isFormValid}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isLoading ? "Menyimpan..." : "Simpan Temuan"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ModalCreateTemuan;
