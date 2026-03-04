import api from "./api";

export interface PermintaanDataItem {
    id_permintaan: number;
    divisi: string;
    level_role?: string;
    [key: string]: any;
}

export interface UserItem {
    id: number;
    name: string;
    level_role?: string;
    [key: string]: any;
}

export interface TemuanItem {
    id_temuan: number;
    id_auditee: number;
    id_auditor: number;
    tanggal_temuan: string;
    judul_temuan: string;
    kondisi_sebenarnya: string;
    keadaan_seharusnya: string;
    penyebab: string;
    dampak: string;
    rekomendasi: string;
    tingkat_keparahan: string;
    status_temuan: string;
    level_role?: string;
    permintaanData?: PermintaanDataItem;
    auditor?: UserItem;
    auditee?: UserItem;
    responTemuans?: ResponTemuan[];
    verifikasi?: {
        id_verifikasi: number;
        status_verifikasi: string;
        catatan: string;
        tanggal_verifikasi: string;
    };
}

export interface ResponTemuan {
    id_respon: number;
    id_temuan: number;
    id_auditee: number;
    status_respon: string;
    tanggal_respon: string;
}

export interface TemuanResponse {
    success: boolean;
    data: TemuanItem | TemuanItem[];
    message?: string;
}

export interface TemuanPaginationInfo {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface TemuanPaginatedResponse {
    success: boolean;
    data: TemuanItem[];
    pagination: TemuanPaginationInfo;
    message?: string;
}

const temuanService = {
    getAll: async (): Promise<TemuanItem[]> => {
        try {
            const res = await api.get<TemuanResponse>("/temuan/");
            return Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        } catch (error) {
            throw error;
        }
    },

    getAllVerif: async (): Promise<TemuanItem[]> => {
        try {
            const res = await api.get<TemuanResponse>("/temuan/verif");
            return Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        } catch (error) {
            throw error;
        }
    },

    getAllPaginated: async (page: number = 1, perPage: number = 5): Promise<TemuanPaginatedResponse> => {
        try {
            const res = await api.get<TemuanPaginatedResponse>(`/temuan/?page=${page}&per_page=${perPage}`);
            return {
                success: res.data.success,
                data: res.data.data,
                pagination: res.data.pagination,
            };
        } catch (error) {
            throw error;
        }
    },

    getAuditees: async (): Promise<any[]> => {
        try {
            const res = await api.get("/users/auditees");
            return res.data.data;
        } catch (error) {
            throw error;
        }
    },

    searchByJudul: async (judul: string): Promise<TemuanItem[]> => {
        try {
            const res = await api.get<TemuanResponse>("/temuan/search", {
                params: { judul }
            });
            return Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        } catch (error) {
            throw error;
        }
    },

    searchByJudulPaginated: async (judul: string, page: number = 1, perPage: number = 5): Promise<TemuanPaginatedResponse> => {
        try {
            const res = await api.get<TemuanPaginatedResponse>("/temuan/search", {
                params: { judul, page, per_page: perPage }
            });
            return {
                success: res.data.success,
                data: res.data.data,
                pagination: res.data.pagination,
            };
        } catch (error) {
            throw error;
        }
    },

    filterByKeparahan: async (keparahan: string, page: number = 1, perPage: number = 5): Promise<TemuanPaginatedResponse> => {
        try {
            const res = await api.get<TemuanPaginatedResponse>("/temuan/filter-keparahan", {
                params: { keparahan, page, per_page: perPage }
            });
            return {
                success: res.data.success,
                data: res.data.data,
                pagination: res.data.pagination,
            };
        } catch (error) {
            throw error;
        }
    },

    filterByStatus: async (status: string, page: number = 1, perPage: number = 5): Promise<TemuanPaginatedResponse> => {
        try {
            const res = await api.get<TemuanPaginatedResponse>("/temuan", {
                params: { status, page, per_page: perPage }
            });
            return {
                success: res.data.success,
                data: res.data.data,
                pagination: res.data.pagination,
            };
        } catch (error) {
            throw error;
        }
    },

    showByAuditeeRole: async (page: number = 1, perPage: number = 5, status: string = "all"): Promise<TemuanPaginatedResponse> => {
        try {
            const res = await api.get<TemuanPaginatedResponse>("/temuan/show-auditee-role", {
                params: { page, per_page: perPage, status }
            });
            return {
                success: res.data.success,
                data: res.data.data,
                pagination: res.data.pagination,
            };
        } catch (error) {
            throw error;
        }
    },

    showByIdAuditee: async (_idAuditee: number, page: number = 1, perPage: number = 5, status: string = "all"): Promise<TemuanPaginatedResponse> => {
        try {
            // idAuditee parameter is ignored - backend uses authenticated user's ID for security
            const res = await api.get<TemuanPaginatedResponse>("/temuan/show-by-id-auditee", {
                params: { page, per_page: perPage, status }
            });
            return {
                success: res.data.success,
                data: res.data.data,
                pagination: res.data.pagination,
            };
        } catch (error) {
            throw error;
        }
    },

    createResponTemuan: async (data: {
        id_temuan: number;
        id_auditee: number;
        status_respon: "Diterima" | "Ditolak";
    }) => {
        try {
            const res = await api.post("/respon-temuans/create", {
                id_temuan: data.id_temuan,
                id_auditee: data.id_auditee,
                status_respon: data.status_respon,
                tanggal_respon: new Date().toISOString().split('T')[0],
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    },

    createTindakLanjut: async (data: {
        id_temuan: number;
        deskripsi_tindak_lanjut: string;
        deskripsi_komitmen: string;
    }) => {
        try {
            const res = await api.post("/tindak-lanjut/createTindakLanjut", {
                id_temuan: data.id_temuan,
                deskripsi_tindak_lanjut: data.deskripsi_tindak_lanjut,
                deskripsi_komitmen: data.deskripsi_komitmen,
                status: "Proses",
            });
            return res.data;
        } catch (error) {
            throw error;
        }
    },

    createTemuan: async (data: {
        id_permintaan?: number | null;
        id_auditee: number;
        tanggal_temuan: string;
        judul_temuan: string;
        kondisi_sebenarnya: string;
        keadaan_seharusnya: string;
        penyebab: string;
        dampak: string;
        rekomendasi: string;
        tingkat_keparahan: "Rendah" | "Sedang" | "Tinggi";
    }) => {
        try {
            const res = await api.post<TemuanResponse>("/temuan/create-temuan", data);
            return res.data.data;
        } catch (error) {
            throw error;
        }
    },

    getTindakLanjutByTemuan: async (idTemuan: number) => {
        try {
            const res = await api.get(`/tindak-lanjut/by-temuan/${idTemuan}`);
            return res.data.data;
        } catch (error) {
            throw error;
        }
    },

    updateVerifikasi: async (idVerifikasi: number, data: {
        catatan?: string | null;
    }) => {
        try {
            const res = await api.post(`/verifikasi/${idVerifikasi}/update`, data);
            return res.data;
        } catch (error) {
            throw error;
        }
    },


    createVerifikasi: async (data: {
        id_tindak_lanjut: number;
        status_verifikasi: "Diterima" | "Ditolak";
        catatan?: string | null;
        tanggal_verifikasi: string;
    }) => {
        try {
            const res = await api.post("/verifikasi/create", data);
            return res.data;
        } catch (error) {
            throw error;
        }
    },

    countByStatus: async (status: string = 'Terbuka'): Promise<number> => {
        try {
            const res = await api.get<{ success: boolean; count: number }>("/temuan/count-by-status", {
                params: { status }
            });
            return res.data.count;
        } catch (error) {
            throw error;
        }
    },
};

export default temuanService;
