import api from "./api";
interface TindakLanjut {
    id_respon: number;
    id_auditee: number;
    deskripsi_tindak_lanjut: string;
    tanggal_komitmen: string;
    status: string;
}

export interface TindakLanjutResponse {
    success: boolean;
    data: TindakLanjut | TindakLanjut[];
    message?: string;
}


const tindakLanjutService = {
    createTindakLanjut: async (data: {
        id_respon: number;
        id_auditee: number;
        deskripsi_tindak_lanjut: string;
        tanggal_komitmen: string;
        status_respon: "Proses" | "Selesai";
    }) => {
        try {
            const res = await api.post("/createTindakLanjut", {
                id_respon: data.id_respon,
                id_auditee: data.id_auditee,
                deskripsi_tindak_lanjut: data.deskripsi_tindak_lanjut,
                tanggal_komitmen: data.tanggal_komitmen,
                status: data.status_respon,
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    },
};

export default tindakLanjutService;