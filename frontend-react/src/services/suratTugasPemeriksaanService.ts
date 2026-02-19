import api from "./api";

export interface SuratTugasPemeriksaanItem {
    id_surat: number;
    id_auditor: number;
    unit_kerja: string;
    tujuan_audit: string;
    deskripsi_permintaan?: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
}

export interface SuratTugasPemeriksaanResponse {
    success: boolean;
    data: SuratTugasPemeriksaanItem | SuratTugasPemeriksaanItem[];
    message?: string;
}

export interface SuratTugasPaginationInfo {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface SuratTugasPaginatedResponse {
    success: boolean;
    data: SuratTugasPemeriksaanItem[];
    pagination: SuratTugasPaginationInfo;
    message?: string;
}

const SuratTugasPemeriksaanService = {

    getAll: async (): Promise<SuratTugasPemeriksaanItem[]> => {
        try {
            const res = await api.get<SuratTugasPemeriksaanResponse>("/surat-tugas/");
            const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
            return data;
        } catch (error) {
            throw error;
        }
    },

    getAllPaginated: async (page: number = 1, perPage: number = 5): Promise<SuratTugasPaginatedResponse> => {
        try {
            const res = await api.get<SuratTugasPaginatedResponse>(`/surat-tugas/?page=${page}&per_page=${perPage}`);
            return {
                success: true,
                data: res.data.data,
                pagination: res.data.pagination,
            };
        } catch (error) {
            throw error;
        }
    },

    searchByUnitKerja: async (unitKerja: string): Promise<SuratTugasPemeriksaanItem[]> => {
        try {
            const res = await api.get<SuratTugasPemeriksaanResponse>("/surat-tugas/search", {
                params: { unit_kerja: unitKerja }
            });
            const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
            return data;
        } catch (error) {
            throw error;
        }
    },

    create: async (payload: {
        id_auditor: number;
        unit_kerja: string;
        tujuan_audit: string;
        deskripsi_permintaan?: string;
        tanggal_mulai: string;
        tanggal_selesai: string;
    }): Promise<SuratTugasPemeriksaanItem> => {
        try {
            const res = await api.post<SuratTugasPemeriksaanResponse>("/surat-tugas/create", payload);
            return res.data.data as SuratTugasPemeriksaanItem;
        } catch (error) {
            throw error;
        }
    },

    generatePDF: async (id: number): Promise<void> => {
        try {
            const res = await api.get(`/surat-tugas/${id}/pdf`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `SuratTugas_${String(id).padStart(3, "0")}_${new Date().getFullYear()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            throw error;
        }
    },

    getPreviewPDF: async (id: number): Promise<Blob> => {
        try {
            const res = await api.get(`/surat-tugas/${id}/pdf`, {
                responseType: "blob",
            });
            return new Blob([res.data], { type: "application/pdf" });
        } catch (error) {
            throw error;
        }
    },
};

export default SuratTugasPemeriksaanService;