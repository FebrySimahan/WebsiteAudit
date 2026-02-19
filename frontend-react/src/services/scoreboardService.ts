import api from "./api";

export interface DetailTemuan {
    Rendah: number;
    Sedang: number;
    Tinggi: number;
}

export interface AuditeeDetail {
    id: number;
    name: string;
    level_role: string;
    temuan_count: number;
    detail_temuan: DetailTemuan;
}

export interface TemuanDetail {
    id_temuan: number;
    judul_temuan: string;
    tingkat_keparahan: string;
    status_temuan: string;
    auditee?: {
        name: string;
    };
}

export interface ScoreboardItem {
    level_role: string;
    poin: number;
    user_count: number;
    temuan_count: number;
    detail_temuan: DetailTemuan;
    auditees: AuditeeDetail[];
    temuans: TemuanDetail[];
}

export interface ScoreboardResponse {
    success: boolean;
    data: ScoreboardItem[];
}

const scoreboardService = {

    getScoreboard: async (): Promise<ScoreboardItem[]> => {
        try {
            const res = await api.get<ScoreboardResponse>("/scoreboard");
            return res.data.data;
        } catch (error) {
            throw error;
        }
    },
};

export default scoreboardService;
