import api from "./api";

export interface User {
    id: number;
    name: string;
    email: string;
    level_role: string;
}

export interface SuratTugas {
    id_surat: number;
    nomor_surat: string;
    tanggal_surat: string;
}

export interface JadwalAudit {
    id_jadwal: number;
    id_permintaan: number;
    tanggal_audit: string;
    status_jadwal: string;
    created_at?: string;
    updated_at?: string;
}

export interface PermintaanDataItem {
    id_permintaan: number;
    id_surat?: number;
    judul_permintaan: string;
    id_auditor: number;
    divisi: string;
    deskripsi: string;
    jenis_permintaan: string;
    status_permintaan: string;
    level_role: string;
    created_at?: string;
    updated_at?: string;
    auditor?: User;
    surat?: SuratTugas;
    jadwal_audits?: JadwalAudit[];
}

export interface PermintaanDataResponse {
    success: boolean;
    data: PermintaanDataItem | PermintaanDataItem[];
    message?: string;
}

export interface PaginationInfo {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface PaginatedResponse {
    success: boolean;
    data: PermintaanDataItem[];
    pagination: PaginationInfo;
    message?: string;
}

const permintaanDataService = {

    /**
     * Ambil semua data permintaan untuk dropdown (tanpa limit 5 data)
     */
    getAllDropdown: async (): Promise<PermintaanDataItem[]> => {
        try {
            const res = await api.get<PermintaanDataResponse>("/permintaan-data/show-all-dropdown");
            const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
            return data;
        } catch (error) {
            throw error;
        }
    },

    getAll: async (): Promise<PermintaanDataItem[]> => {
        try {
            const res = await api.get<PermintaanDataResponse>("/permintaan-data/show-all-paginated");
            const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
            console.log("Permintaan Data Response:", data);
            console.log("First item:", data[0]);
            return data;
        } catch (error) {
            throw error;
        }
    },

    getAllPermintaan: async (): Promise<PermintaanDataItem[]> => {
        try {
            const res = await api.get<PermintaanDataResponse>("/permintaan-data/auditor-temuan");
            const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
            console.log("Permintaan Data Response:", data);
            console.log("First item:", data[0]);
            return data;
        } catch (error) {
            throw error;
        }
    },

    getAllPaginated: async (page: number = 1, perPage: number = 5): Promise<PaginatedResponse> => {
        try {
            const res = await api.get<PaginatedResponse>(`/permintaan-data/show-all-paginated?page=${page}&per_page=${perPage}`);
            return {
                success: res.data.success,
                data: res.data.data,
                pagination: res.data.pagination,
            };
        } catch (error) {
            throw error;
        }
    },

    getStatusAktif: async (): Promise<PermintaanDataItem[]> => {
        try {
            const res = await api.get<PermintaanDataResponse>("/permintaan-data/status-aktif");
            const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
            console.log("Permintaan Data Status Aktif Response:", data);
            console.log("First item:", data[0]);
            return data;
        } catch (error) {
            throw error;
        }
    },

    getStatusBerjalan: async (): Promise<PermintaanDataItem[]> => {
        try {
            const res = await api.get<PermintaanDataResponse>("/permintaan-data/status-berjalan");
            const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
            console.log("Permintaan Data Status Berjalan Response:", data);
            console.log("First item:", data[0]);
            return data;
        } catch (error) {
            throw error;
        }
    },

    getStatusSelesai: async (): Promise<PermintaanDataItem[]> => {
        try {
            const res = await api.get<PermintaanDataResponse>("/permintaan-data/status-selesai");
            const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
            console.log("Permintaan Data Status Selesai Response:", data);
            console.log("First item:", data[0]);
            return data;
        } catch (error) {
            throw error;
        }
    },

    searchByJudul: async (judul: string): Promise<PermintaanDataItem[]> => {
        try {
            const res = await api.get<PermintaanDataResponse>("/permintaan-data/search", {
                params: { judul }
            });
            const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
            console.log("Permintaan Data Search By Judul Response:", data);
            console.log("First item:", data[0]);
            return data;
        } catch (error) {
            throw error;
        }
    },

    searchByJudulPaginated: async (judul: string, page: number = 1, perPage: number = 5): Promise<PaginatedResponse> => {
        try {
            const res = await api.get<PaginatedResponse>("/permintaan-data/search", {
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


    getAllByAuditorPaginated: async (page: number = 1, perPage: number = 5): Promise<PaginatedResponse> => {
        try {
            const res = await api.get<PaginatedResponse>(`/permintaan-data/auditor?page=${page}&per_page=${perPage}`);
            return {
                success: res.data.success,
                data: res.data.data,
                pagination: res.data.pagination,
            };
        } catch (error) {
            throw error;
        }
    },

    searchByJudulAuditor: async (judul: string): Promise<PermintaanDataItem[]> => {
        try {
            const res = await api.get<PermintaanDataResponse>("/permintaan-data/auditor/search", {
                params: { judul }
            });
            const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
            return data;
        } catch (error) {
            throw error;
        }
    },

    filterByStatus: async (status: string, page: number = 1, perPage: number = 5): Promise<PaginatedResponse> => {
        try {
            const res = await api.get<PaginatedResponse>("/permintaan-data/auditor/filter-status", {
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

    filterByStatusDireksi: async (status: string, page: number = 1, perPage: number = 5): Promise<PaginatedResponse> => {
        try {
            const res = await api.get<PaginatedResponse>("/permintaan-data/direksi/filter-status", {
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

    createPermintaanData: async (payload: {
        id_surat: number;
        level_role: string;
        judul_permintaan: string;
        deskripsi: string;
        divisi: string;
        jenis_permintaan: string;
        jadwal_audit: string[];
    }): Promise<PermintaanDataItem> => {
        try {
            const res = await api.post<PermintaanDataResponse>("/permintaan-data/auditor/create", payload);
            return res.data.data as PermintaanDataItem;
        } catch (error) {
            throw error;
        }
    },

    setSelesai: async (id_permintaan: number): Promise<void> => {
        try {
            await api.post(`/permintaan-data/${id_permintaan}/set-selesai`);
        } catch (error) {
            throw error;
        }
    },

    getAuditees: async () => {
        try {
            const res = await api.get("/users/auditees");
            return res.data.data;
        } catch (error) {
            throw error;
        }
    },
};

export default permintaanDataService;
