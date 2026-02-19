import api from './api';

class PdfService {
    async getPermintaanDataPdf(id: number, jadwalIds?: number[]): Promise<Blob> {
        const params = jadwalIds && jadwalIds.length > 0
            ? { jadwal_ids: jadwalIds.join(',') }
            : {};

        const response = await api.get(`/permintaan-data/${id}/pdf`, {
            params,
            responseType: 'blob'
        });
        return response.data;
    }

    async getPermintaanDataAuditorPdf(id: number, jadwalIds?: number[]): Promise<Blob> {
        const params = jadwalIds && jadwalIds.length > 0
            ? { jadwal_ids: jadwalIds.join(',') }
            : {};

        const response = await api.get(`/permintaan-data/auditor/${id}/pdf-preview`, {
            params,
            responseType: 'blob'
        });
        return response.data;
    }

    async getTemuanPdf(id: number): Promise<Blob> {
        const response = await api.get(`/temuan/${id}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    }
}

export default new PdfService();
